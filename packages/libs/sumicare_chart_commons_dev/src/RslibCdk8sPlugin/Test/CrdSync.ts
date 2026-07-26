/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { sha256 } from "Commons/Dev/Crypto";
import { hasNetwork } from "Commons/Dev/Network";
import {
	type CrdSourceOpts,
	createCrdSourceUtils,
} from "Commons/Dev/RslibCdk8sPlugin/CrdSourceUtils";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "@rstest/core";
import type { UpstreamSource } from "@sumicare/chart-commons";
import { stringify } from "yaml";

const isTransformed = (content: string) =>
	content.includes("{{") ||
	(!content.startsWith("---") && !content.startsWith("apiVersion"));

const assertSync = async (utils: ReturnType<typeof createCrdSourceUtils>) => {
	const { CRD_FILES, readFile, fetchUpstreamFile } = utils;
	await Promise.all(
		CRD_FILES.map(async (file) => {
			const upstream = await fetchUpstreamFile(file);
			if (!isTransformed(upstream)) expect(readFile(file)).toBe(upstream);
		}),
	);
};

const buildSnapshot = (
	utils: ReturnType<typeof createCrdSourceUtils>,
	shas: Record<string, string>,
	fallback?: string,
) => {
	const { CRD_FILES, readFile } = utils;
	return Object.fromEntries(
		CRD_FILES.map((f) => [
			f,
			{ hash: sha256(readFile(f)), commitHash: shas[f] ?? fallback },
		]),
	);
};

/**
 * Creates a CRD sync test that verifies local CRD YAML files match upstream,
 * and snapshots their SHA-256 hashes with the latest commit SHA.
 *
 * Files with Helm template directives or non-CRD envelopes are skipped —
 * they are transformed during bump and can't be compared byte-for-byte.
 */
export const createCrdSyncTest = (
	opts: CrdSourceOpts,
	syncOpts?: { fallbackCommitHash?: string },
) => {
	const utils = createCrdSourceUtils(opts);
	const fallback = syncOpts?.fallbackCommitHash;

	test("local CRDs are in sync with upstream", async ({ skip }) => {
		if (!(await hasNetwork())) return skip();

		let shas: Record<string, string>;
		try {
			shas = await utils.fetchCommitShas();
		} catch {
			return skip();
		}

		await assertSync(utils);

		const snapshot = buildSnapshot(utils, shas, fallback);
		await expect(stringify(snapshot)).toMatchFileSnapshot(
			"./__snapshots__/crd-sync.snapshot.yaml",
		);
	}, 30_000);
};

/** Convenience wrapper that derives `crdsDir` from the caller's `import.meta.url`. */
export const createCrdSyncTestFromSources = (
	sources: { upstream: Record<string, UpstreamSource> },
	testFileUrl: string,
	syncOpts?: { fallbackCommitHash?: string },
) => {
	const dir = dirname(fileURLToPath(testFileUrl));
	createCrdSyncTest(
		{ crdsDir: join(dir, "..", "crds"), upstream: sources.upstream },
		syncOpts,
	);
};
