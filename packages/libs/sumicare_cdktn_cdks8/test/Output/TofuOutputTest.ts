/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	buildTofuArgs,
	createTofuOutput,
	type TofuOutputConfig,
} from "CdkTnCdk8s/Output/TofuOutput";
import { execSync } from "node:child_process";
import { AwsProvider } from "@cdktn/provider-aws/lib/provider";
import { S3Bucket } from "@cdktn/provider-aws/lib/s3-bucket";
import { expect, test } from "@rstest/core";
import { App, TerraformOutput, TerraformStack } from "cdktn";

const setupStack = (app: App) => {
	const stack = new TerraformStack(app, "Stack");
	new AwsProvider(stack, "aws", { region: "us-east-1" });
	return {
		stack,
		bucket: new S3Bucket(stack, "Bucket", { bucket: "test-bucket" }),
	};
};

const argCases: readonly {
	readonly name: string;
	readonly config?: TofuOutputConfig;
	readonly expected: readonly string[];
}[] = [
	{
		name: "default",
		config: undefined,
		expected: ["output", "-json", "-no-color"],
	},
	{
		name: "state path",
		config: { statePath: "/tmp/state.tfstate" },
		expected: ["-state=/tmp/state.tfstate"],
	},
	{
		name: "show sensitive",
		config: { showSensitive: true },
		expected: ["-show-sensitive"],
	},
	{
		name: "var files",
		config: { varFiles: ["a.tfvars", "b.tfvars"] },
		expected: ["-var-file=a.tfvars", "-var-file=b.tfvars"],
	},
	{
		name: "vars",
		config: { vars: { region: "us-east-1", env: "prod" } },
		expected: ["-var=region=us-east-1", "-var=env=prod"],
	},
	{
		name: "all options combined",
		config: {
			statePath: "/tmp/state.tfstate",
			showSensitive: true,
			varFiles: ["vars.tfvars"],
			vars: { key: "val" },
		},
		expected: [
			"-state=/tmp/state.tfstate",
			"-show-sensitive",
			"-var-file=vars.tfvars",
			"-var=key=val",
		],
	},
];

test.for(argCases)("buildTofuArgs: $name", ({ config, expected }) => {
	const args = buildTofuArgs(config);
	for (const e of expected) expect(args).toContain(e);
});

test("buildTofuArgs default args always include -json and -no-color", () => {
	expect(buildTofuArgs().slice(0, 3)).toEqual(["output", "-json", "-no-color"]);
});

test("createTofuOutput invokes tofu CLI", ({ skip }) => {
	try {
		execSync("tofu --version", { stdio: "ignore" });
	} catch {
		skip();
		return;
	}

	const app = new App();
	const { stack, bucket } = setupStack(app);
	new TerraformOutput(stack, "Output", { value: bucket.bucket });
	expect(() => createTofuOutput().fetch(app)).toThrow();
});
