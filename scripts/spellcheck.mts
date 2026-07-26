#!/usr/bin/env node

/**
 * Spell check script using cspell.
 *
 * Reads the cSpell.words allow-list from sumicare_rules.code-workspace
 * so that the CLI and the VS Code extension share the same dictionary.
 *
 * Usage:
 *   pnpm tsx scripts/spellcheck.mts [globs...]
 *   pnpm tsx scripts/spellcheck.mts --exclude [globs...]
 *
 * --exclude   Collect unknown words, merge into cSpell.words
 *             (lowercased, sorted, deduplicated).
 *
 * Pruning of unused words runs automatically during lint mode.
 */

import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const cwd = process.cwd();

/** Path to the VS Code workspace file holding the shared cSpell dictionary. */
const WS = join(cwd, "sumicare_rules.code-workspace");
/** Paths excluded from spell checking in the generated cspell config. */
const IGNORE_PATHS = ["node_modules/**", ".git/**", "dist/**", "build/**", "pnpm-lock.yaml"];
/** Default file extensions scanned when no explicit globs are passed. */
const DEFAULT_GLOBS = ["ts", "mts", "tsx", "js", "jsx", "json", "md", "py", "bzl", "bazel", "yaml", "yml"].map((e) => `**/*.${e}`);
/** Glob negations applied to the default scan set. */
const EXCLUDE_GLOBS = [
	...["node_modules", ".git", "dist", "build", ".venv", ".turbo", ".ruff_cache", "cdktf.out", ".coverage", "crds"].map((d) => `!**/${d}/**`),
	"!**/pnpm-lock.yaml",
	"!**/*.tsbuildinfo",
	"!**/routeTree.gen.ts",
];

/** Strip JSONC comments and trailing commas so `JSON.parse` can read the workspace file. */
const stripJsonc = (s: string) =>
	s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "").replace(/,\s*([}\]])/g, "$1");

/** Return a sorted, deduplicated copy of an array. */
const sortUnique = (arr: string[]) =>
	[...new Set(arr)].sort((a, b) => a.localeCompare(b));

/** Split text into trimmed, non-empty lines. */
const lines = (s: string) =>
	s.split("\n").map((l) => l.trim()).filter(Boolean);

/** Lowercase all strings in an array. */
const lower = (arr: string[]) => arr.map((w) => w.toLowerCase());

/** Partition an array into `[matching, notMatching]` based on a predicate. */
const partition = <T>(arr: T[], pred: (v: T) => boolean): [T[], T[]] => [
	arr.filter(pred),
	arr.filter((v) => !pred(v)),
];

/** Read `cSpell.language` and `cSpell.words` from the workspace file. */
const readWorkspace = async () => {
	const settings = (JSON.parse(stripJsonc(await readFile(WS, "utf-8"))) as { settings?: Record<string, unknown> }).settings ?? {};
	return {
		language: (settings["cSpell.language"] as string) ?? "en",
		words: sortUnique(lower((settings["cSpell.words"] as string[]) ?? [])),
	};
};

/** Build a cspell config object as JSON string. */
const configJson = (language: string, words: string[]) =>
	JSON.stringify({ version: "0.2", language, words, ignorePaths: IGNORE_PATHS }, null, 2);

/** Run `cspell lint` with the given config and globs, returning exit code and stdout. */
const runCspell = (cfg: string, globs: string[]) =>
	new Promise<{ code: number; stdout: string }>((resolve) => {
		const args = ["cspell", "lint", "--config", cfg, "--gitignore", "--no-progress", "--no-summary", ...globs];
		const child = spawn("npx", args, { cwd, stdio: ["inherit", "pipe", "inherit"] as ["inherit", "pipe", "inherit"] });
		let stdout = "";
		child.stdout?.on("data", (d: Buffer) => { stdout += d; });
		child.on("close", (c) => resolve({ code: c ?? 1, stdout }));
		child.on("error", (e) => { console.error(e); resolve({ code: 1, stdout }); });
	});

/** Replace the `cSpell.words` array in the workspace file with the given list. */
const writeWords = async (words: string[]) => {
	const raw = await readFile(WS, "utf-8");
	const replacement = `"cSpell.words": [\n${words.map((w) => `      "${w}"`).join(",\n")},\n    ]`;
	const updated = raw.replace(/"cSpell\.words":\s*\[[\s\S]*?\]/, replacement);
	if (updated === raw) {
		console.error("Could not find cSpell.words in workspace file");
		process.exit(1);
	}
	await writeFile(WS, updated, "utf-8");
};

/** Prune dictionary words not found in the scanned output. Returns the kept list. */
const pruneFromFound = async (words: string[], foundWords: Set<string>): Promise<string[]> => {
	const [kept, pruned] = partition(words, (w) => foundWords.has(w));
	if (pruned.length > 0) {
		await writeWords(kept);
		console.log(`Pruned ${pruned.length} unused word(s) from cSpell.words (remaining: ${kept.length})`);
		pruned.forEach((w) => console.log(`  - ${w}`));
	}
	return kept;
};

/** Merge candidate words into the dictionary. Returns the merged list. */
const addWords = async (words: string[], candidates: string[]): Promise<string[]> => {
	const existing = new Set(words);
	const added = sortUnique(candidates.filter((w) => !existing.has(w)));
	if (!added.length) {
		console.log("No new words to exclude.");
		return words;
	}
	const merged = sortUnique([...words, ...added]);
	await writeWords(merged);
	console.log(`Added ${added.length} new word(s) to cSpell.words (total: ${merged.length})`);
	added.forEach((w) => console.log(`  + ${w}`));
	return merged;
};

/** Parsed cspell issue: file, line, column, word. */
type Issue = { file: string; line: number; col: number; word: string };

/** Parse cspell lint stdout into a list of issues. */
const parseIssues = (stdout: string): Issue[] =>
	lines(stdout)
		.map((l) => l.match(/^(.+?):(\d+):(\d+)\s*-\s*Unknown word\s*\(([^)]+)\)/))
		.filter((m): m is RegExpMatchArray => m !== null)
		.map((m) => {
			const [, file, ln, col, word] = m;
			return { file, line: +ln, col: +col, word: word.toLowerCase() };
		});

/** Group issues by file path. */
const groupByFile = (issues: Issue[]): Map<string, Issue[]> => {
	const map = new Map<string, Issue[]>();
	for (const issue of issues) {
		const arr = map.get(issue.file) ?? [];
		arr.push(issue);
		map.set(issue.file, arr);
	}
	return map;
};

/** Print a concise per-file summary of spelling issues. */
const printIssues = (issues: Issue[]) => {
	if (!issues.length) {
		console.log("No spelling issues found.");
		return;
	}
	const grouped = groupByFile(issues);
	console.log(`\n${grouped.size} file(s) with ${issues.length} spelling issue(s):`);
	for (const [file, arr] of grouped) {
		console.log(`\n  ${file} (${arr.length})`);
		for (const { line, word } of arr)
			console.log(`    L${line}: ${word}`);
	}
};

/** Entry point: run cspell in lint or `--exclude` (add-to-dictionary) mode. */
const main = async () => {
	const exclude = process.argv.includes("--exclude");
	const globs = process.argv.slice(2).filter((a) => !a.startsWith("--"));
	const allGlobs = globs.length > 0 ? globs : [...DEFAULT_GLOBS, ...EXCLUDE_GLOBS];
	const { language, words } = await readWorkspace();
	console.log(`Loaded ${words.length} word(s) from ${WS}`);

	const tmp = await mkdtemp(join(tmpdir(), "cspell-"));
	// Single scan with empty dictionary — every word in the codebase is "unknown".
	// We partition in JS: words in our dictionary = used, rest = real issues.
	const cfg = join(tmp, "cspell.json");
	await writeFile(cfg, configJson(language, []));

	try {
		const { stdout } = await runCspell(cfg, allGlobs);
		const allIssues = parseIssues(stdout);
		const dict = new Set(words);

		// Split: dictionary words found in code = used, non-dictionary = real issues.
		const [usedIssues, realIssues] = partition(allIssues, (i) => dict.has(i.word));
		const foundWords = new Set(usedIssues.map((i) => i.word));

		// Prune dictionary words not found in any file.
		const kept = await pruneFromFound(words, foundWords);

		if (exclude) {
			await addWords(kept, realIssues.map((i) => i.word));
			return;
		}

		printIssues(realIssues);
		process.exit(realIssues.length > 0 ? 1 : 0);
	} finally {
		await rm(tmp, { recursive: true, force: true });
	}
};

main().catch((e) => { console.error(e); process.exit(1); });
