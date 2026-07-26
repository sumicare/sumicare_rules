/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parse } from "yaml";

type ReplacementValue = string;

type FileReplacements = {
	replace?: Record<string, ReplacementValue>;
	template?: string;
};

export type ReplacementsManifest = Record<string, FileReplacements>;

const REPLACEMENTS_FILE = ".cdk8s.replacements.yaml";

/** Walks up from `dir` until it finds the replacements file or a `.git` marker. */
export const findRoot = (dir: string) => {
	const walk = (current: string): string => {
		if (existsSync(join(current, REPLACEMENTS_FILE))) return current;
		if (existsSync(join(current, ".git"))) return current;
		const parent = dirname(current);
		return parent === current ? dir : walk(parent);
	};
	return walk(dir);
};

/** Reads and parses `.cdk8s.replacements.yaml` from the given directory. */
export const loadReplacements = (rootDir: string) => {
	const filePath = join(rootDir, REPLACEMENTS_FILE);
	if (!existsSync(filePath)) return {};
	return parse(readFileSync(filePath, "utf-8")) as ReplacementsManifest;
};

/**
 * Applies the replacement pipeline for the given file.
 *
 * 1. If `template` is present, apply `replace` rules to the raw content,
 *    then insert the result (indented) into the template at `{{ content }}`.
 * 2. If no `template`, apply `replace` rules to the content directly.
 * 3. Scan the result for remaining `{{ ... }}` placeholders.
 * 4. Return `{ content, unexpected }` where `unexpected` is the list of
 *    unresolved `{{ ... }}` patterns.
 */
export const applyReplacements = (
	file: string,
	content: string,
	manifest: ReplacementsManifest,
) => {
	const entry = manifest[file];
	if (!entry) return { content, unexpected: [] as string[] };

	const replaced = entry.replace
		? Object.entries(entry.replace).reduce(
				(acc, [pattern, value]) => acc.replaceAll(pattern, value),
				content,
			)
		: content;

	const result = entry.template
		? entry.template.replace(/^[ \t]*{{ content }}[ \t]*$/m, () =>
				replaced
					.split("\n")
					.map((l) => `  ${l}`)
					.join("\n"),
			)
		: replaced;

	return {
		content: result,
		unexpected: result.match(/\{\{[^}]*\}\}/g) ?? [],
	};
};

/**
 * Removes Go template directives (`{{ ... }}`) from a YAML string.
 * Template expressions are stripped inline; lines that become empty
 * or whitespace-only after stripping are removed entirely.
 */
export const stripHelmTemplates = (content: string) => {
	if (!content.includes("{{")) return content;
	const lines = content.split("\n");
	const result: string[] = [];

	let idx = 0;
	while (idx < lines.length) {
		const line = lines[idx];
		const openCount = (line.match(/\{\{/g) ?? []).length;
		const closeCount = (line.match(/\}\}/g) ?? []).length;

		if (openCount > closeCount) {
			const collected = [line];
			let unclosed = openCount - closeCount;
			let next = idx + 1;
			while (next < lines.length && unclosed > 0) {
				collected.push(lines[next]);
				unclosed += (lines[next].match(/\{\{/g) ?? []).length;
				unclosed -= (lines[next].match(/\}\}/g) ?? []).length;
				next++;
			}
			const kept = collected
				.join("\n")
				.replace(/\{\{[\s\S]*?\}\}/g, "")
				.split("\n")
				.filter((sl) => sl.trim() !== "");
			for (const sl of kept) result.push(sl);
			idx = next;
			continue;
		}

		const stripped = line.replace(/\{\{[^}]*\}\}/g, "");
		if (stripped.trim() !== "") result.push(stripped);
		idx++;
	}

	return `${result.join("\n")}\n`;
};
