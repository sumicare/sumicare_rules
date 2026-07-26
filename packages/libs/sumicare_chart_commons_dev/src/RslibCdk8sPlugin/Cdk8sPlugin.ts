/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { bumpCrds } from "Commons/Dev/RslibCdk8sPlugin/BumpCrds";
import {
	findRoot,
	loadReplacements,
} from "Commons/Dev/RslibCdk8sPlugin/HelmTransforms";

import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { UpstreamSource } from "@sumicare/chart-commons";

export type RslibPlugin = {
	name: string;
	setup(api: {
		onBeforeBuild: (
			fn: (params: {
				isWatch: boolean;
				isFirstCompile: boolean;
			}) => void | Promise<void>,
		) => void;
	}): void;
};

/** Configuration for the CRD bump plugin. */
export type CrdsConfig = {
	upstream: UpstreamSource | Record<string, UpstreamSource>;
};

/** Creates an Rslib plugin that bumps CRDs from upstream and runs `cdk8s import` before the build. */
export const cdk8sPlugin = (dir: string, crds: CrdsConfig): RslibPlugin => ({
	name: "cdk8s",
	setup(api) {
		api.onBeforeBuild(async () => {
			const replacements = loadReplacements(findRoot(dir));
			const changed = await bumpCrds(
				{ crdsDir: join(dir, "crds"), upstream: crds.upstream },
				dir,
				{ replacements },
			);
			if (changed) {
				const label = `[crd-bump:${dir.split("/").pop()}]`;
				console.log(`${label} regenerating cdk8s imports…`);
				execSync("pnpm cdk8s import", { cwd: dir, stdio: "ignore" });
				console.log(`${label} updating test snapshots…`);
				execSync("pnpm rstest -u", { cwd: dir, stdio: "ignore" });
			} else if (!existsSync(join(dir, "imports"))) {
				execSync("pnpm cdk8s import", { cwd: dir, stdio: "ignore" });
			}
		});
	},
});
