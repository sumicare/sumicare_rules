import { defineConfig } from "@rstest/core";

export default defineConfig({
	coverage: {
		provider: "v8",
		include: ["**/src/**/*.ts"],
		reportsDirectory: "./.coverage",
		reporters: ["text", "lcov"],
		clean: true,
	},
	projects: [
		"packages/stacks/sumicare_*/rstest.config.ts",
		"packages/stacks/sumicare_*/charts/sumicare_*/rstest.config.ts",
		"packages/stacks/sumicare_*/charts/sumicare_*/charts/sumicare_*/rstest.config.ts",
		"packages/libs/sumicare_*/rstest.config.ts",
		"packages/services/sumicare_*/rstest.config.ts",
	],
});
