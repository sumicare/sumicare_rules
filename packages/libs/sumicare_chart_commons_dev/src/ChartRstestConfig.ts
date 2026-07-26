/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { withRslibConfig } from "@rstest/adapter-rslib";
import { defineConfig, defineInlineProject } from "@rstest/core";

/** Creates a standard RStest config for Sumicare chart packages. */
export const chartRsTestConfig = (name: string, configUrl: string) => {
	const root = dirname(fileURLToPath(configUrl));

	return defineConfig({
		coverage: {
			provider: "v8",
			include: ["src/**/*.ts"],
			reportsDirectory: "./.coverage",
			reporters: ["text", "lcov"],
			clean: true,
		},
		projects: [
			defineInlineProject({
				name,
				root,
				extends: withRslibConfig({ cwd: root }),
				include: ["test/**/*Test.ts"],
			}),
		],
	});
};
