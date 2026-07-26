/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { hasNetwork } from "Commons/Dev/Network";
import {
	type CrdSourceOpts,
	createCrdSourceUtils,
} from "Commons/Dev/RslibCdk8sPlugin/CrdSourceUtils";
import {
	applyReplacements,
	type ReplacementsManifest,
	stripHelmTemplates,
} from "Commons/Dev/RslibCdk8sPlugin/HelmTransforms";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

/**
 * Downloads changed CRD files from upstream, applies Helm template
 * replacements and stripping, and writes them to the `crds/` directory.
 *
 * Returns `true` if any CRDs were downloaded and written.
 */
export const bumpCrds = async (
	opts: CrdSourceOpts,
	pkgDir: string,
	bumpOpts?: { replacements?: ReplacementsManifest },
) => {
	if (!(await hasNetwork())) return false;

	const utils = createCrdSourceUtils(opts);
	const { CRDS_DIR, CRD_FILES, fetchUpstreamFile, fetchCommitShas } = utils;
	const replacements = bumpOpts?.replacements ?? {};

	const SNAPSHOT_FILE = join(
		pkgDir,
		"test/__snapshots__/crd-sync.snapshot.yaml",
	);

	const crdsExist = existsSync(CRDS_DIR);
	const snapshot = existsSync(SNAPSHOT_FILE)
		? (parse(readFileSync(SNAPSHOT_FILE, "utf-8")) as Record<
				string,
				{ commitHash: string }
			>)
		: {};

	let shas: Record<string, string>;
	try {
		shas = await fetchCommitShas();
	} catch (err) {
		if (crdsExist) {
			console.warn(`[${pkgDir}]: using existing CRDs due to ${err}`);
			return false;
		}
		throw err;
	}

	const toUpdate = CRD_FILES.filter(
		(f) =>
			!existsSync(join(CRDS_DIR, f)) || snapshot[f]?.commitHash !== shas[f],
	);

	if (toUpdate.length === 0) return false;

	const label = `[crd-bump:${pkgDir.split("/").pop()}]`;
	console.log(
		`${label} downloading ${toUpdate.length} CRD${toUpdate.length > 1 ? "s" : ""} from upstream…`,
	);

	mkdirSync(CRDS_DIR, { recursive: true });

	await Promise.all(
		toUpdate.map(async (file) => {
			console.log(`${label}   ↓ ${file}`);
			const text = await fetchUpstreamFile(file);
			const { content: replaced, unexpected } = applyReplacements(
				file,
				text,
				replacements,
			);
			if (unexpected.length > 0) {
				throw new Error(
					`Unexpected Helm placeholders in ${file}:\n` +
						unexpected.map((p) => `  ${p}`).join("\n") +
						`\nAdd replacements to .cdk8s.replacements.yaml`,
				);
			}
			const content = stripHelmTemplates(replaced);
			const remaining = content.match(/\{\{[^}]*\}\}/g);
			if (remaining) {
				throw new Error(
					`Unresolved Helm placeholders in ${file} after stripping:\n` +
						remaining.map((p) => `  ${p}`).join("\n") +
						`\nAdd replacements to .cdk8s.replacements.yaml`,
				);
			}
			writeFileSync(join(CRDS_DIR, file), content);
		}),
	);

	return true;
};
