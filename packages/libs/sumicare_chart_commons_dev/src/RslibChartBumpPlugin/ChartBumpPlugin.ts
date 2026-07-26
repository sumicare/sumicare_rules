/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { RslibPlugin } from "Commons/Dev/RslibCdk8sPlugin/Cdk8sPlugin";
import {
	type BumpConfig,
	bumpVersions,
} from "Commons/Dev/RslibChartBumpPlugin/BumpVersions";

/** Creates an Rslib plugin that bumps `Version.ts` files from upstream GitHub releases before the build. */
export const chartBumpPlugin = (
	dir: string,
	bump: BumpConfig,
): RslibPlugin => ({
	name: "chart-bump",
	setup(api) {
		api.onBeforeBuild(async () => {
			await bumpVersions(dir, bump);
		});
	},
});

export type { BumpConfig } from "Commons/Dev/RslibChartBumpPlugin/BumpVersions";
