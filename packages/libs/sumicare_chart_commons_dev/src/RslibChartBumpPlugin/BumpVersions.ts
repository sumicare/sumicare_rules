/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { hasNetwork } from "Commons/Dev/Network";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fetchLatestRelease, type VersionSpec } from "@sumicare/chart-commons";

/** Configuration for the version bump plugin. */
export type BumpConfig = VersionSpec & {
	/** Version file to update, relative to the package directory. Defaults to `"./src/Version.ts"`. */
	versionFile?: string;
};

const VERSION_PATTERN = /(knownLatest:\s*")([^"]+)(")/;

/** Fetches the latest release and updates the `Version.ts` file in-place. Returns `true` if changed. */
export const bumpVersions = async (dir: string, config: BumpConfig) => {
	if (!(await hasNetwork())) return false;

	const label = `[${dir.split("/").pop()}]`;
	const latest = await fetchLatestRelease(config);

	const versionFile = config.versionFile ?? "./src/Version.ts";
	const filePath = join(dir, versionFile);
	if (!existsSync(filePath)) return false;

	const content = readFileSync(filePath, "utf-8");
	const match = content.match(VERSION_PATTERN);
	const current = match?.[2];

	if (current === latest) {
		console.log(`${label} already up to date (${current})`);
		return false;
	}

	const updated = content.replace(VERSION_PATTERN, `$1${latest}$3`);
	if (updated === content) return false;

	writeFileSync(filePath, updated);
	console.log(`${label} ${current} → ${latest}`);
	return true;
};
