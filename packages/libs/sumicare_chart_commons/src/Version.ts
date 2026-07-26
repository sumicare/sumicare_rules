/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { fetchLatestRelease } from "Commons/Source";

/** Chart upstream version source and pinned fallback. */
export type VersionSpec = {
	owner: string;
	repo: string;
	/** Pinned fallback used when offline. Coalesces to `"0.0.0"`. */
	knownLatest?: string;
	namePrefix?: string;
	nameSuffix?: string;
};

/** Creates a version triple: known-latest constant, async fetcher, and a promise that falls back when offline. */
export const createVersion = (spec: VersionSpec) => {
	const knownLatest = spec.knownLatest ?? "0.0.0";
	return {
		KnownLatest: knownLatest,
		fetchLatest: () => fetchLatestRelease(spec),
		Latest: fetchLatestRelease(spec).catch(() => knownLatest),
	};
};
