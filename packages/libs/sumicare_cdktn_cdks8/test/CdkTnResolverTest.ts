/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	buildOutputIndex,
	createCdkTnResolver,
	lookupOutput,
} from "CdkTnCdk8s/CdkTnResolver";
import type { StackOutputs } from "CdkTnCdk8s/Output/StackOutputs";
import { AwsProvider } from "@cdktn/provider-aws/lib/provider";
import { S3Bucket } from "@cdktn/provider-aws/lib/s3-bucket";
import { expect, test } from "@rstest/core";
import * as cdk8s from "cdk8s";
import {
	App,
	DefaultTokenResolver,
	type Expression,
	Fn,
	type ITerraformAddressable,
	StringConcat,
	TerraformOutput,
	TerraformStack,
	Tokenization,
} from "cdktn";
import { stringify } from "yaml";

const setupStack = (app: App) => {
	const stack = new TerraformStack(app, "Stack");
	new AwsProvider(stack, "aws", { region: "us-east-1" });
	return {
		stack,
		bucket: new S3Bucket(stack, "Bucket", { bucket: "test-bucket" }),
	};
};

const tfResolver = new DefaultTokenResolver(new StringConcat());

const resolveOutputValue = (output: TerraformOutput) => {
	const raw = output.toTerraform().output[output.friendlyUniqueId].value;
	return Tokenization.resolve(raw, {
		scope: output,
		preparing: false,
		resolver: tfResolver,
	}) as string | number | boolean | null;
};

const mockOutputs = (app: App) =>
	app.node
		.findAll()
		.filter((c): c is TerraformOutput => TerraformOutput.isTerraformOutput(c))
		.reduce<StackOutputs>((data, output) => {
			const stack = TerraformStack.of(output);
			const stackId = stack.node.id;
			data[stackId] ??= {};
			data[stackId][output.friendlyUniqueId] = resolveOutputValue(output);
			return data;
		}, {});

const snapshotPath = (name: string) =>
	`./__snapshots__/${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.yaml`;

const makeChart = (resolvers: cdk8s.IResolver[]) =>
	new cdk8s.Chart(cdk8s.Testing.app({ resolvers }), "Chart");

const makeApiObject = (
	chart: cdk8s.Chart,
	name: string,
	spec: Record<string, unknown>,
) =>
	new cdk8s.ApiObject(chart, name, {
		apiVersion: "v1",
		kind: "Struct",
		spec,
	});

const toYaml = (obj: cdk8s.ApiObject) =>
	stringify(obj.toJson(), { sortMapEntries: true });

const resolveCases: readonly {
	readonly name: string;
	readonly makeValue: (b: S3Bucket) => Expression | ITerraformAddressable;
	readonly outputScope: "stack" | "bucket";
	readonly shouldThrow?: string;
}[] = [
	{
		name: "direct output value",
		makeValue: (b) => b.bucket,
		outputScope: "stack",
	},
	{
		name: "indirect output value",
		makeValue: (b) => {
			const name = b.bucket;
			return name;
		},
		outputScope: "stack",
	},
	{
		name: "number attribute",
		makeValue: (b) => b.getNumberAttribute("attr"),
		outputScope: "stack",
	},
	{
		name: "boolean attribute",
		makeValue: (b) => b.getBooleanAttribute("attr"),
		outputScope: "stack",
	},
	{
		name: "token map attribute",
		makeValue: (b) => b.getAnyMapAttribute("attr"),
		outputScope: "stack",
	},
	{
		name: "token list attribute",
		makeValue: (b) => b.getListAttribute("attr"),
		outputScope: "stack",
	},
	{
		name: "expression value",
		makeValue: (b) => Fn.upper(b.bucket),
		outputScope: "stack",
	},
	{
		name: "nested output scope",
		makeValue: (b) => b.bucket,
		outputScope: "bucket",
	},
	{
		name: "full resource",
		makeValue: (b) => b,
		outputScope: "stack",
	},
	{
		name: "literal map (should fail)",
		makeValue: (b) => ({ bucketName: b.bucket }),
		outputScope: "stack",
		shouldThrow: "Unable to find output defined for",
	},
	{
		name: "literal array (should fail)",
		makeValue: (b) => [b.bucket],
		outputScope: "stack",
		shouldThrow: "Unable to find output defined for",
	},
];

test("buildOutputIndex indexes outputs by value", () => {
	const app = new App();
	const { stack, bucket } = setupStack(app);
	const value = bucket.bucket;
	new TerraformOutput(stack, "Output", { value });
	expect(buildOutputIndex(app).get(value)?.friendlyUniqueId).toBe("Output");
});

test("buildOutputIndex first-wins for duplicate values", () => {
	const app = new App();
	const { stack, bucket } = setupStack(app);
	const value = bucket.bucket;
	new TerraformOutput(stack, "First", { value });
	new TerraformOutput(stack, "Second", { value });
	expect(buildOutputIndex(app).get(value)?.friendlyUniqueId).toBe("First");
});

test("lookupOutput returns output for indexed value", () => {
	const app = new App();
	const { stack, bucket } = setupStack(app);
	const value = bucket.bucket;
	new TerraformOutput(stack, "Output", { value });
	expect(lookupOutput(buildOutputIndex(app), value, app).friendlyUniqueId).toBe(
		"Output",
	);
});

test("lookupOutput throws for unindexed value", () => {
	const app = new App();
	const { stack } = setupStack(app);
	new TerraformOutput(stack, "Output", { value: "known" });
	expect(() => lookupOutput(buildOutputIndex(app), "unknown", app)).toThrow(
		"Unable to find output defined for",
	);
});

test("resolver reuses cached index across multiple resolutions", () => {
	const awsApp = new App();
	const resolver = createCdkTnResolver({
		app: awsApp,
		fetchOutputsFn: () => ({ Stack: { Output: "resolved-value" } }),
	});

	const { stack, bucket } = setupStack(awsApp);
	const value = bucket.bucket;
	const chart = makeChart([resolver]);
	const obj1 = makeApiObject(chart, "First", { prop1: value });
	new TerraformOutput(stack, "Output", { value });

	expect(toYaml(obj1)).toContain("resolved-value");

	const obj2 = makeApiObject(chart, "Second", { prop1: value });
	expect(toYaml(obj2)).toContain("resolved-value");
});

test.for(resolveCases)("resolve: $name", async (tc) => {
	const awsApp = new App();
	const resolver = createCdkTnResolver({
		app: awsApp,
		fetchOutputsFn: () => mockOutputs(awsApp),
	});

	const { stack, bucket } = setupStack(awsApp);
	const chart = makeChart([resolver]);
	const value = tc.makeValue(bucket) as Expression | ITerraformAddressable;
	const outputScope = tc.outputScope === "bucket" ? bucket : stack;
	new TerraformOutput(outputScope, "Output", { value });
	const obj = makeApiObject(chart, "ApiObject", { prop1: value });

	if (tc.shouldThrow) {
		expect(() => obj.toJson()).toThrow(tc.shouldThrow);
	} else {
		await expect(toYaml(obj)).toMatchFileSnapshot(
			snapshotPath(`resolve-${tc.name}`),
		);
	}
});

const outputCases: readonly {
	readonly name: string;
	readonly props: Omit<Parameters<typeof createCdkTnResolver>[0], "app">;
	readonly expected: string;
}[] = [
	{
		name: "fetchOutputsFn takes precedence over cdktnCli and tofuDirect",
		props: {
			fetchOutputsFn: () => ({ Stack: { Output: "custom-value" } }),
			cdktnCli: { includeSensitiveOutputs: true },
			tofuDirect: { binary: "tofu" },
		},
		expected: "custom-value",
	},
	{
		name: "tofuDirect takes precedence over cdktnCli",
		props: {
			tofuDirect: { binary: "tofu" },
			cdktnCli: { includeSensitiveOutputs: true },
		},
		expected: "Failed fetching value for output",
	},
	{
		name: "default cdktnCli fails gracefully when CLI unavailable",
		props: {},
		expected: "Failed fetching value for output",
	},
];

test.for(outputCases)("$name", ({ props, expected }) => {
	const awsApp = new App();
	const resolver = createCdkTnResolver({ ...props, app: awsApp });
	const { stack, bucket } = setupStack(awsApp);
	const value = bucket.bucket;
	new TerraformOutput(stack, "Output", { value });
	const chart = makeChart([resolver]);
	const obj = makeApiObject(chart, "ApiObject", { prop1: value });
	expect(toYaml(obj)).toContain(expected);
});
