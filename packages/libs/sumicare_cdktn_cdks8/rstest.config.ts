/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withRslibConfig } from "@rstest/adapter-rslib";
import { defineConfig, defineInlineProject } from "@rstest/core";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	coverage: {
		provider: "v8",
		include: ["src/**/*.ts"],
		reportsDirectory: "./.coverage",
		reporters: ["text", "lcov"],
		clean: true,
	},
	projects: [
		defineInlineProject({
			name: "cdk8s-cdktn",
			root,
			extends: withRslibConfig({ cwd: root }),
			include: ["test/**/*Test.ts"],
		}),
	],
});
