/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { defineConfig } from "@rslib/core";

export default defineConfig({
	plugins: [],
	lib: [
		{ format: "esm", syntax: "es2022", dts: true },
		{ format: "cjs", syntax: "es2022" },
	],
	source: {
		entry: {
			index: "./src/CdkTnCdk8s.ts",
			resolver: "./src/CdkTnResolver.ts",
		},
		tsconfigPath: "./tsconfig.json",
	},
	output: {
		target: "node",
		legalComments: "none",
	},
});
