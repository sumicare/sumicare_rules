/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type CrdsConfig,
	cdk8sPlugin,
	type RslibPlugin,
} from "Commons/Dev/RslibCdk8sPlugin/Cdk8sPlugin";
import { chartBumpPlugin } from "Commons/Dev/RslibChartBumpPlugin/ChartBumpPlugin";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { defineConfig } from "@rslib/core";
import type { VersionSpec } from "@sumicare/chart-commons";

export type ChartRslibOptions = {
	entry: string;
	plugins?: RslibPlugin[];
	copy?: Array<{ from: string; to: string }>;
	extraEntries?: Record<string, string>;
	crds?: CrdsConfig;
	version?: VersionSpec;
	versionFile?: string;
};

/** Creates a standard Rslib config for Sumicare chart packages. */
export const chartRslibConfig = (options: ChartRslibOptions) => {
	const dir = process.cwd();

	const plugins: RslibPlugin[] = [];

	if (options.crds) {
		plugins.push(cdk8sPlugin(dir, options.crds));
	}

	if (options.version) {
		plugins.push(
			chartBumpPlugin(dir, {
				...options.version,
				...(options.versionFile ? { versionFile: options.versionFile } : {}),
			}),
		);
	}

	if (options.plugins) {
		plugins.push(...options.plugins);
	}

	const entry: Record<string, string> = { index: options.entry };
	if (options.extraEntries) {
		Object.assign(entry, options.extraEntries);
	}

	const copy =
		options.copy ??
		(existsSync(join(dir, "crds"))
			? [{ from: "crds", to: "crds" }]
			: undefined);

	return defineConfig({
		plugins,
		lib: [
			{
				format: "esm",
				syntax: "es2022",
				dts: true,
				autoExternal: { dependencies: true, peerDependencies: true },
			},
			{
				format: "cjs",
				syntax: "es2022",
				autoExternal: { dependencies: true, peerDependencies: true },
			},
		],
		source: {
			entry,
			tsconfigPath: "./tsconfig.json",
		},
		output: {
			target: "node",
			legalComments: "none",
			...(copy ? { copy } : {}),
		},
	});
};
