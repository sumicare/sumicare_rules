/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	buildCdkTnArgs,
	buildCdkTnEnv,
	type CdkTnCliOutputConfig,
	createCdkTnCliOutput,
} from "CdkTnCdk8s/Output/CdkTnCliOutput";
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

const makeMultiStackApp = () => {
	const app = new App();
	new TerraformStack(app, "StackA");
	new TerraformStack(app, "StackB");
	return app;
};

const argCases: readonly {
	readonly name: string;
	readonly config?: CdkTnCliOutputConfig;
	readonly expected: readonly string[];
}[] = [
	{
		name: "default",
		config: undefined,
		expected: ["--skip-synth", "--outputs-file", "outputs.json"],
	},
	{
		name: "sensitive outputs",
		config: { includeSensitiveOutputs: true },
		expected: ["--outputs-file-include-sensitive-outputs"],
	},
	{
		name: "skip provider lock",
		config: { skipProviderLock: true },
		expected: ["--skip-provider-lock"],
	},
	{
		name: "disable plugin cache",
		config: { disablePluginCache: true },
		expected: ["--disable-plugin-cache-env"],
	},
	{
		name: "log level",
		config: { logLevel: "debug" },
		expected: ["--log-level", "debug"],
	},
	{
		name: "log file directory",
		config: { logFileDirectory: "/tmp/logs" },
		expected: ["--log-file-directory", "/tmp/logs"],
	},
	{
		name: "custom dirs",
		config: { appDir: "custom.out", outputsFile: "custom.json" },
		expected: ["--output", "custom.out", "--outputs-file", "custom.json"],
	},
];

test.for(argCases)("buildCdkTnArgs: $name", ({ config, expected }) => {
	const args = buildCdkTnArgs(
		makeMultiStackApp(),
		config?.appDir ?? "cdktn.out",
		config?.outputsFile ?? "outputs.json",
		config,
	);
	for (const e of expected) expect(args).toContain(e);
});

test("buildCdkTnArgs includes all stack IDs", () => {
	const args = buildCdkTnArgs(makeMultiStackApp(), "cdktn.out", "outputs.json");
	expect(args).toContain("StackA");
	expect(args).toContain("StackB");
});

const envCases: readonly {
	readonly name: string;
	readonly config?: CdkTnCliOutputConfig;
	readonly key: string;
	readonly value: string;
}[] = [
	{
		name: "default binary is tofu",
		config: undefined,
		key: "TERRAFORM_BINARY_NAME",
		value: "tofu",
	},
	{
		name: "explicit terraform binary",
		config: { binary: "terraform" },
		key: "TERRAFORM_BINARY_NAME",
		value: "terraform",
	},
	{
		name: "parallelism",
		config: { parallelism: 4 },
		key: "CDKTF_PARALLELISM",
		value: "4",
	},
];

test.for(envCases)("buildCdkTnEnv: $name", ({ config, key, value }) => {
	expect(buildCdkTnEnv(config)[key]).toBe(value);
});

test("buildCdkTnEnv does not set parallelism for -1", () => {
	expect(buildCdkTnEnv({ parallelism: -1 }).CDKTF_PARALLELISM).toBeUndefined();
});

test("createCdkTnCliOutput invokes cdktn CLI", () => {
	const app = new App();
	const { stack, bucket } = setupStack(app);
	new TerraformOutput(stack, "Output", { value: bucket.bucket });
	expect(() => createCdkTnCliOutput().fetch(app)).toThrow();
});
