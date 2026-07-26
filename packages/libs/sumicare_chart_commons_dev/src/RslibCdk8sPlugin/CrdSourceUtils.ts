/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { UpstreamSource } from "@sumicare/chart-commons";
import {
	fetchSha,
	lookupUpstream,
	rawUrl,
	resolveCrdFiles,
} from "@sumicare/chart-commons";

/** Options for {@link createCrdSourceUtils}. */
export type CrdSourceOpts = {
	crdsDir: string;
	upstream: UpstreamSource | Record<string, UpstreamSource>;
	files?: string[];
};

/**
 * Creates CRD source utilities for a CRD chart package.
 *
 * Handles both single-repo and multi-repo configurations.
 */
export const createCrdSourceUtils = (opts: CrdSourceOpts) => {
	const { crdsDir, upstream } = opts;
	const getUpstream = lookupUpstream(upstream);
	const CRD_FILES = resolveCrdFiles(crdsDir, upstream, opts.files);

	const fetchUpstreamFile = async (file: string) => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 30_000);
		const res = await fetch(rawUrl(getUpstream(file), file), {
			signal: controller.signal,
		}).finally(() => clearTimeout(timeout));
		if (!res.ok) throw new Error(`Failed to download ${file}: ${res.status}`);
		return res.text();
	};

	return {
		CRDS_DIR: crdsDir,
		CRD_FILES,
		readFile: (f: string) => readFileSync(join(crdsDir, f), "utf-8"),
		upstreamUrl: (file: string) => rawUrl(getUpstream(file), file),
		fetchUpstreamFile,
		fetchCommitShas: async () =>
			Object.fromEntries(
				await Promise.all(
					CRD_FILES.map(
						async (f) => [f, await fetchSha(getUpstream(f), f)] as const,
					),
				),
			),
	};
};
