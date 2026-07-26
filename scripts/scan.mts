#!/usr/bin/env node

/**
 * SBOM scan & merge script.
 *
 * Runs `syft` on each lockfile in TARGETS, merges CycloneDX SBOMs,
 * then scans with `grype`. Fails on unpatched vulnerabilities.
 *
 * Usage: pnpm tsx scripts/scan.mts
 */

import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Generic record type used for untyped JSON structures. */
type Rec = Record<string, unknown>;

/** CycloneDX SBOM document structure (subset of fields used by this script). */
type CycloneDX = {
	specVersion: string;
	components: Rec[];
	dependencies?: Rec[];
	metadata?: Rec;
	[key: string]: unknown;
};

/** Lockfiles scanned by `syft` to produce SBOMs. */
const TARGETS = ["./pnpm-lock.yaml", "./packages/services/sumicare_agents/uv.lock"];

/** Spawn a child process, capturing stdout/stderr. Resolves with stdout on exit 0. */
const run = (cmd: string, args: string[], stdio: ("inherit" | "pipe" | "ignore")[] = ["inherit", "pipe", "pipe"]): Promise<string> =>
	new Promise((resolve, reject) => {
		const child = spawn(cmd, args, { stdio: stdio as [("inherit" | "pipe" | "ignore"), ("inherit" | "pipe" | "ignore"), ("inherit" | "pipe" | "ignore")] });
		let out = "";
		let err = "";
		child.stdout?.on("data", (d: Buffer) => { out += d; });
		child.stderr?.on("data", (d: Buffer) => { err += d; });
		child.on("close", (c) => c === 0 ? resolve(out) : reject(new Error(err || `exit ${c}`)));
		child.on("error", reject);
	});

/** Deduplicate items by a computed key, preserving first occurrence. */
const dedup = <T,>(items: T[], key: (t: T) => string): T[] => {
	const seen = new Set<string>();
	return items.filter((t) => { const k = key(t); if (k && !seen.has(k)) { seen.add(k); return true; } return false; });
};

/** Merge multiple CycloneDX SBOMs into a single document with deduplicated components and dependencies. */
const mergeSboms = (sboms: CycloneDX[]): CycloneDX => {
	const v = sboms[0]?.specVersion ?? "1.5";
	return {
		$schema: `http://cyclonedx.org/schema/bom-${v}.schema.json`,
		bomFormat: "CycloneDX",
		specVersion: v,
		serialNumber: `urn:uuid:${randomUUID()}`,
		version: 1,
		metadata: sboms[0]?.metadata ?? {},
		components: dedup(sboms.flatMap((s) => s.components ?? []), (c) => c.purl as string ?? c.bomRef as string ?? `${c.name}@${c.version}`),
		dependencies: dedup((sboms.flatMap((s) => (s.dependencies ?? []) as Rec[])), (d) => d.ref as string),
	};
};

/** Format a grype vulnerability match as a human-readable string. */
const fmtVuln = (m: Rec) => {
	const a = m.artifact as Rec;
	const v = m.vulnerability as Rec;
	const fix = (v.fix as Rec)?.versions;
	return `  [${v.severity ?? "?"}] ${a.name}@${a.version} — ${v.id}${fix ? ` (fixed in ${fix})` : ""}`;
};

/** Entry point: generate SBOMs, merge, scan with grype, report vulnerabilities. */
const main = async () => {
	const tmp = await mkdtemp(join(tmpdir(), "sbom-"));
	try {
		// Generate a CycloneDX SBOM for each lockfile via syft.
		const sboms = await Promise.all(TARGETS.map(async (t, i) => {
			await run("syft", ["scan", t, "--output", `cyclonedx-json=${join(tmp, `sbom-${i}.json`)}`]);
			return JSON.parse(await readFile(join(tmp, `sbom-${i}.json`), "utf-8")) as CycloneDX;
		}));

		await writeFile("sbom.json", JSON.stringify(mergeSboms(sboms), null, 2), "utf-8");

		// Scan the merged SBOM with grype and classify matches.
		const stdout = await run("grype", ["sbom.json", "-o", "json"], ["ignore", "pipe", "pipe"]);
		const matches = ((JSON.parse(stdout) as Rec).matches ?? []) as Rec[];
		const isPatched = (m: Rec) => { const fix = (m.vulnerability as Rec)?.fix as Rec; return !!fix?.versions || !!fix?.state; };

		if (matches.length === 0) {
			console.log("No vulnerabilities found.");
			return 0;
		}
		const patched = matches.filter(isPatched);
		const unpatched = matches.filter((m) => !isPatched(m));
		if (patched.length > 0) {
			console.error(`${patched.length} patched vulnerabilit${patched.length === 1 ? "y" : "ies"}:`);
			patched.forEach((m) => console.error(fmtVuln(m)));
		}
		if (unpatched.length > 0) {
			console.error(`${unpatched.length} unpatched vulnerabilit${unpatched.length === 1 ? "y" : "ies"}:`);
			unpatched.forEach((m) => console.error(fmtVuln(m)));
		}
		return 1;
	} finally {
		await rm(tmp, { recursive: true, force: true });
		await rm("sbom.json", { force: true });
	}
};

main().then((code) => process.exit(code)).catch((e) => { console.error(e); process.exit(1); });
