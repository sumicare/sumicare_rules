export default {
	extends: ["@commitlint/config-conventional"],
	rules: {
		"header-max-length": [2, "always", 120],
		"scope-enum": [
			2,
			"always",
			["chart", "stack", "bump", "service", "rule", "lib", "doc"],
		],
	},
};
