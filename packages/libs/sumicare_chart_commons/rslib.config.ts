/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { defineConfig } from "@rslib/core";

export default defineConfig({
	lib: [
		{
			format: "esm",
			syntax: "es2022",
			dts: true,
			autoExternal: {
				dependencies: true,
				peerDependencies: true,
			},
		},
		{
			format: "cjs",
			syntax: "es2022",
			autoExternal: {
				dependencies: true,
				peerDependencies: true,
			},
		},
	],
	source: {
		entry: {
			index: "./src/Commons.ts",
			crds: "./src/Crds.ts",
		},
		tsconfigPath: "./tsconfig.json",
	},
	output: {
		target: "node",
		legalComments: "none",
	},
	performance: {
		buildCache: false,
	},
});
