#!/usr/bin/env node

/**
 * Workspace dependency management script.
 *
 * Modes:
 *   --dry-run   Compute sync changes without writing to disk.
 *   (default)   Sync internal deps, shared devDeps, biome schema, changeset.
 *
 * Usage:
 *   pnpm taze && pnpm tsx scripts/sync-workspace-deps.mts [--dry-run]
 */

import { globSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseDocument } from "yaml";

/** npm package.json dependency section keys. */
type DepSection = "dependencies" | "devDependencies" | "optionalDependencies";

/** Subset of package.json fields used by this script. */
type PkgJson = {
	name?: string;
	version?: string;
	private?: boolean;
	dependencies?: Record<string, string>;
	devDependencies?: Record<string, string>;
	optionalDependencies?: Record<string, string>;
};

const cwd = process.cwd();
const DRY_RUN = process.argv.includes("--dry-run");

/** Dependency sections to scan for internal version mismatches. */
const SECTIONS: readonly DepSection[] = ["dependencies", "devDependencies", "optionalDependencies"];

/** Root devDep patterns propagated to all workspace packages. */
const SHARED_DEV_DEP_PATTERNS = ["@types/*"];

/** @types/* packages kept even when the runtime package is not a direct dependency. */
const TYPES_ALWAYS_INCLUDE = new Set(["@types/node"]);

/** JSON indentation — matches .editorconfig / biome.json (tab). */
const INDENT = "\t";

/** Match a glob-like pattern (with `*` wildcards) against a package name. */
const matchGlob = (pattern: string, name: string) =>
	new RegExp(`^${pattern.replace(/\./g, "\\.").replace(/\*/g, ".*")}$`).test(name);

/** Strip semver range prefix (`^`, `~`, `>=`, etc.) from a version spec. */
const stripPrefix = (spec: string) => spec.replace(/^[~^>=<]*/, "").trim();

/** Return a new object with keys sorted alphabetically. */
const sortDeps = (deps: Record<string, string>) =>
	Object.fromEntries(Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)));

/** Log a change to stdout and collect it for the changeset entry. */
const logChange = (pkgName: string, message: string, changes: string[]) => {
	console.log(`  [${pkgName}] ${message}`);
	changes.push(`- ${message}`);
};

const readJson = async (path: string) => {
	try {
		return JSON.parse(await readFile(path, "utf-8")) as PkgJson;
	} catch {
		return null;
	}
};

const writeJson = async (path: string, content: PkgJson) => {
	await writeFile(path, `${JSON.stringify(content, null, INDENT)}\n`, "utf-8");
};

const readWorkspaceDoc = async () => {
	const raw = await readFile(join(cwd, "pnpm-workspace.yaml"), "utf-8");
	return parseDocument(raw).toJSON() as Record<string, unknown>;
};

/**
 * Discover all package.json files matching the pnpm-workspace.yaml globs,
 * plus the root package.json.
 */
const findPkgJsons = async () => {
	const doc = await readWorkspaceDoc();
	const patterns = (doc.packages as string[]) ?? [];
	const files = [...new Set(
		patterns.flatMap((p) => globSync(`${p}/package.json`, { cwd }))
			.concat(globSync("package.json", { cwd }))
			.map((p) => join(cwd, p)),
	)];
	return (await Promise.all(files.map(async (path) => {
		const content = await readJson(path);
		return content ? { path, content } : null;
	}))).filter(Boolean) as { path: string; content: PkgJson }[];
};

/** Build a `name -> version` map from all workspace packages. */
const internalVersions = (pkgJsons: { path: string; content: PkgJson }[]) =>
	new Map(pkgJsons.filter((p) => p.content.name && p.content.version).map((p) => [p.content.name!, p.content.version!]));

/**
 * Update internal dependency specs in a non-root package to match
 * the actual workspace versions.
 */
const applyInternalDeps = (content: PkgJson, internals: Map<string, string>, pkgName: string) => {
	const changes: string[] = [];
	const next = { ...content };
	for (const sec of SECTIONS) {
		const deps = content[sec];
		if (!deps) {
			continue;
		}
		next[sec] = Object.fromEntries(
			Object.entries(deps).map(([name, spec]) => {
				const iv = internals.get(name);
				if (!iv || spec === iv) {
					return [name, spec];
				}
				logChange(pkgName, `\`${name}\`: ${spec} -> ${iv} (internal)`, changes);
				return [name, iv];
			}),
		);
	}
	return { content: next, changes };
};

/**
 * Rebuild the root package.json `dependencies` block so that it contains
 * exactly all workspace packages (minus self), removing stale `@sumicare/*`
 * entries and adding missing ones.
 */
const syncRootDependencies = (
	content: PkgJson,
	internals: Map<string, string>,
	pkgName: string,
) => {
	const changes: string[] = [];
	const deps = { ...(content.dependencies ?? {}) };

	// Remove @sumicare/* entries that no longer correspond to a workspace package.
	for (const name of Object.keys(deps)) {
		if (internals.has(name) || name === content.name) {
			continue;
		}
		if (name.startsWith("@sumicare/")) {
			logChange(pkgName, `\`${name}\`: removed (no longer in workspace)`, changes);
			delete deps[name];
		}
	}

	// Add or update all workspace packages.
	for (const [name, version] of internals) {
		if (name === content.name) {
			continue;
		}
		const prev = deps[name];
		if (prev === version) {
			continue;
		}
		const label = prev ? `${prev} -> ${version} (workspace)` : "added (workspace)";
		logChange(pkgName, `\`${name}\`: ${label}`, changes);
		deps[name] = version;
	}

	return { content: { ...content, dependencies: sortDeps(deps) }, changes };
};

/** Extract the runtime package name from an `@types/*` package (e.g. `@types/node` -> `node`). */
const runtimePkgForTypes = (typesName: string) =>
	typesName.startsWith("@types/") ? typesName.slice("@types/".length) : null;

/**
 * Propagate shared devDeps (matching `SHARED_DEV_DEP_PATTERNS`) from the root
 * to a non-root package. `@types/*` packages are only kept if the corresponding
 * runtime package is a direct dependency (or in `TYPES_ALWAYS_INCLUDE`).
 */
const applySharedDevDeps = (content: PkgJson, rootDevDeps: Record<string, string>, pkgName: string) => {
	const changes: string[] = [];
	const deps = { ...(content.devDependencies ?? {}) };
	const runtimeDeps = new Set(Object.keys(content.dependencies ?? {}));

	for (const [name, spec] of Object.entries(rootDevDeps)) {
		if (!SHARED_DEV_DEP_PATTERNS.some((p) => matchGlob(p, name))) {
			continue;
		}
		// Remove @types/* if the runtime package is not a direct dependency.
		const runtime = runtimePkgForTypes(name);
		if (runtime && !TYPES_ALWAYS_INCLUDE.has(name) && !runtimeDeps.has(runtime)) {
			if (deps[name]) {
				logChange(pkgName, `\`${name}\`: removed (no \`${runtime}\` in deps)`, changes);
				delete deps[name];
			}
			continue;
		}
		if (deps[name] === spec) {
			continue;
		}
		const prev = deps[name] ?? "(none)";
		logChange(pkgName, `\`${name}\`: ${prev} -> ${spec} (shared)`, changes);
		deps[name] = spec;
	}
	return {
		content: { ...content, devDependencies: sortDeps(deps) },
		changes,
	};
};

/** Sync the `$schema` version in biome.json to match the installed @biomejs/biome version. */
const syncBiomeSchema = async () => {
	const rootPkg = await readJson(join(cwd, "package.json"));
	const biomeSpec = rootPkg?.devDependencies?.["@biomejs/biome"];
	if (!biomeSpec) {
		return false;
	}
	const biomeVer = stripPrefix(biomeSpec);
	try {
		const raw = await readFile(join(cwd, "biome.json"), "utf-8");
		const m = raw.match(/"\$schema":\s*"https:\/\/biomejs\.dev\/schemas\/([^/]+)\/schema\.json"/);
		if (!m || m[1] === biomeVer) {
			return false;
		}
		if (!DRY_RUN) {
			await writeFile(join(cwd, "biome.json"), raw.replace(m[0], `"$schema": "https://biomejs.dev/schemas/${biomeVer}/schema.json"`), "utf-8");
		}
		console.log(`  [biome.json] $schema: ${m[1]} -> ${biomeVer}`);
		return true;
	} catch {
		return false;
	}
};

/** Write a changeset entry for all public packages with changes. */
const writeChangeset = async (results: { name?: string; private?: boolean; changes: string[] }[]) => {
	const pkgs = results.filter((r) => r.name && !r.private && r.changes.length > 0);
	if (pkgs.length === 0) {
		return false;
	}
	const frontmatter = pkgs.map((r) => `"${r.name}": patch`).join("\n");
	const body = pkgs.map((r) => `### ${r.name}\n\n${r.changes.join("\n")}`).join("\n\n");
	const date = new Date().toISOString().slice(0, 10);
	let filename = `.changeset/dep-update-${date}.md`;
	// Avoid clobbering an existing changeset from the same day.
	for (let i = 2; !DRY_RUN && await readFile(join(cwd, filename), "utf-8").then(() => true).catch(() => false); i++) {
		filename = `.changeset/dep-update-${date}-${i}.md`;
	}
	if (!DRY_RUN) await writeFile(join(cwd, filename), `---\n${frontmatter}\n---\n\n${body}\n`, "utf-8");
	console.log(`  Wrote changeset: ${filename}`);
	return true;
};

/**
 * Sync a single package: root gets full workspace dep reconciliation,
 * non-root gets internal version alignment + shared devDeps.
 */
const syncPackage = async (
	pkg: { path: string; content: PkgJson },
	internals: Map<string, string>,
	rootDevDeps: Record<string, string>,
	isRoot: boolean,
) => {
	const { path, content } = pkg;
	const pkgName = content.name ?? path;

	// Step 1: reconcile dependency versions.
	const step1 = isRoot
		? syncRootDependencies(content, internals, pkgName)
		: applyInternalDeps(content, internals, pkgName);

	// Step 2: propagate shared devDeps (non-root only).
	const step2 = isRoot
		? { content: step1.content, changes: [] as string[] }
		: applySharedDevDeps(step1.content, rootDevDeps, pkgName);

	if (JSON.stringify(step2.content) === JSON.stringify(content)) {
		return null;
	}

	if (!DRY_RUN) {
		await writeJson(path, step2.content);
	}

	return { name: content.name, private: content.private, changes: [...step1.changes, ...step2.changes] };
};

/** Entry point: discover packages, sync deps, write changeset, update biome schema. */
const syncMain = async () => {
	const pkgJsons = await findPkgJsons();
	const internals = internalVersions(pkgJsons);
	const rootPath = join(cwd, "package.json");
	const rootDevDeps = pkgJsons.find((p) => p.path === rootPath)?.content.devDependencies ?? {};

	const results = (await Promise.all(
		pkgJsons.map((pkg) => syncPackage(pkg, internals, rootDevDeps, pkg.path === rootPath)),
	)).filter(Boolean) as { name?: string; private?: boolean; changes: string[] }[];

	const changed = results.length;
	const changesetWritten = await writeChangeset(results);
	const biomeSynced = await syncBiomeSchema();

	if (changed > 0 || biomeSynced || changesetWritten) {
		console.log(`\n${DRY_RUN ? "[dry-run] " : ""}${changed} pkg(s)${biomeSynced ? " + biome.json schema" : ""}${changesetWritten ? " + changeset" : ""} updated`);
	}
};

syncMain().catch((e: unknown) => { console.error(e); process.exit(1); });
