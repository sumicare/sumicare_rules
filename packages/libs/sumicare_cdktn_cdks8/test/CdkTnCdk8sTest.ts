/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	createCdk8sProvider,
	escapeTerraformInterpolation,
	manifestId,
	parseManifests,
} from "CdkTnCdk8s/CdkTnCdk8s";
import { createCdkTnResolver } from "CdkTnCdk8s/CdkTnResolver";
import type { StackOutputs } from "CdkTnCdk8s/Output/StackOutputs";
import { AwsProvider } from "@cdktn/provider-aws/lib/provider";
import { S3Bucket } from "@cdktn/provider-aws/lib/s3-bucket";
import { expect, test } from "@rstest/core";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import * as cdk8s from "cdk8s";
import {
	App,
	DefaultTokenResolver,
	StringConcat,
	TerraformOutput,
	TerraformStack,
	Testing,
	Tokenization,
} from "cdktn";
import { stringify } from "yaml";

const snapshotPath = (name: string) =>
	`./__snapshots__/${name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.yaml`;

const toYaml = (synth: string) =>
	stringify(JSON.parse(synth), { sortMapEntries: true });

const TestRbac = defineRbac<"test">({
	name: "TestRbac",
	serviceAccounts: ["test"],
	roles: [
		{
			name: "test-cluster-role",
			rules: [
				{ verbs: ["get", "list", "watch"], endpoints: ["pods"] },
				{ verbs: ["create", "update"], endpoints: ["configMaps"] },
			],
			bind: ["test"],
		},
		{
			name: "test-namespaced-role",
			scope: "namespace",
			rules: [{ verbs: ["get", "list"], endpoints: ["secrets"] }],
			bind: ["test"],
		},
	],
});

const setupProvider = (
	scopeCallback: (chart: cdk8s.Chart) => void,
	providerId = "cdk8s-provider",
	config: Record<string, unknown> = {},
) => {
	const app = Testing.app();
	const stack = new TerraformStack(app, "Stack");
	const cdk8sApp = cdk8s.Testing.app();
	const chart = new cdk8s.Chart(cdk8sApp, "chart");
	scopeCallback(chart);
	createCdk8sProvider({
		scope: stack,
		id: providerId,
		config: { cdk8sApp, ...config },
	});
	return Testing.synth(stack);
};

test("synthesizes RBAC chart into CDKTN plan", async () => {
	const synth = setupProvider((chart) => {
		new TestRbac(chart, "rbac", {
			name: "test-app",
			namespace: "default",
			labels: commonLabels({ name: "test-app", version: "1.0.0" }),
		});
	});
	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("rbac-manifests"),
	);
});

test("escapes terraform-like interpolation in manifest values", async () => {
	const synth = setupProvider((chart) => {
		new cdk8s.ApiObject(chart, "configmap", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "interp-cm" },
			data: {
				"config.yaml": "key: ${var.notTerraformJustLooksLikeIt}value\nfoo: bar",
			},
		});
	});
	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("escapes-values"),
	);
});

test("can use multiple providers against different clusters", async () => {
	const app = Testing.app();
	const stack = new TerraformStack(app, "Stack");
	const cdk8sApp = cdk8s.Testing.app();
	const chart = new cdk8s.Chart(cdk8sApp, "chart");
	new TestRbac(chart, "rbac", {
		name: "test-app",
		namespace: "default",
		labels: commonLabels({ name: "test-app", version: "1.0.0" }),
	});
	createCdk8sProvider({
		scope: stack,
		id: "cdk8s-provider",
		config: { cdk8sApp },
	});
	createCdk8sProvider({
		scope: stack,
		id: "cdk8s-provider-2",
		config: { cdk8sApp, configContext: "my-other-context" },
	});
	const synth = Testing.synth(stack);
	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("multiple-providers"),
	);
});

test("handles empty cdk8s app with no manifests", async () => {
	const synth = setupProvider(() => {
		// no manifests created
	});
	await expect(toYaml(synth)).toMatchFileSnapshot(snapshotPath("empty-app"));
});

test("escapes newlines in manifest string values", async () => {
	const synth = setupProvider((chart) => {
		new cdk8s.ApiObject(chart, "configmap", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "multiline-cm" },
			data: {
				"config.yaml": "key: value\nnested:\n  foo: bar\n",
			},
		});
	});
	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("escapes-newlines"),
	);
});

test("uses generateName fallback when name is absent", async () => {
	const synth = setupProvider((chart) => {
		new cdk8s.ApiObject(chart, "job", {
			apiVersion: "batch/v1",
			kind: "Job",
			metadata: { generateName: "auto-job-" },
			spec: {
				template: {
					spec: {
						restartPolicy: "Never",
						containers: [
							{
								name: "pi",
								image: "perl:5.34.0",
								command: ["perl", "-Mbignum=bpi", "-wle", "print bpi(2000)"],
							},
						],
					},
				},
			},
		});
	});
	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("generate-name"),
	);
});

test("escapeTerraformInterpolation handles primitives and nested structures", () => {
	expect(escapeTerraformInterpolation(null)).toBe(null);
	expect(escapeTerraformInterpolation(42)).toBe(42);
	expect(escapeTerraformInterpolation(true)).toBe(true);
	expect(escapeTerraformInterpolation("plain")).toBe("plain");
	expect(escapeTerraformInterpolation("a${b}c")).toBe("a$${b}c");
	expect(escapeTerraformInterpolation("a\nb")).toBe("a\\nb");
	expect(escapeTerraformInterpolation(["a${b}", "c\nd"])).toStrictEqual([
		"a$${b}",
		"c\\nd",
	]);
	expect(
		escapeTerraformInterpolation({ a: "${x}", b: { c: "y\nz" }, d: 1 }),
	).toStrictEqual({ a: "$${x}", b: { c: "y\\nz" }, d: 1 });
});

test("manifestId covers name, generateName, and unnamed fallbacks", () => {
	const base = { apiVersion: "v1", kind: "Pod" };
	expect(
		manifestId("p", { ...base, metadata: { name: "foo", namespace: "ns" } }),
	).toBe("p-v1-Pod-foo-ns");
	expect(manifestId("p", { ...base, metadata: { generateName: "gen-" } })).toBe(
		"p-v1-Pod-gen--default",
	);
	expect(manifestId("p", { ...base, metadata: {} })).toBe(
		"p-v1-Pod-unnamed-default",
	);
});

test("parseManifests filters out null and invalid documents", () => {
	const yamlStr = [
		"apiVersion: v1",
		"kind: ConfigMap",
		"metadata:",
		"  name: valid",
		"---",
		"---",
		"null",
		"---",
		"justAString",
	].join("\n");
	const manifests = parseManifests(yamlStr);
	expect(manifests).toHaveLength(1);
	expect(manifests[0]?.metadata?.name).toBe("valid");
});

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

const setupIntegration = (
	chartCallback: (
		chart: cdk8s.Chart,
		infraStack: TerraformStack,
		bucket: S3Bucket,
	) => void,
	fetchOutputsFn: (app: App) => StackOutputs,
) => {
	const infraApp = new App();
	const infraStack = new TerraformStack(infraApp, "infra");
	new AwsProvider(infraStack, "aws", { region: "us-east-1" });
	const bucket = new S3Bucket(infraStack, "Bucket", { bucket: "test-bucket" });

	const cdk8sApp = cdk8s.Testing.app({
		resolvers: [createCdkTnResolver({ app: infraApp, fetchOutputsFn })],
	});
	const chart = new cdk8s.Chart(cdk8sApp, "chart");
	chartCallback(chart, infraStack, bucket);

	const platformApp = Testing.app();
	const platformStack = new TerraformStack(platformApp, "platform");
	createCdk8sProvider({
		scope: platformStack,
		id: "cdk8s-provider",
		config: { cdk8sApp },
	});
	return Testing.synth(platformStack);
};

test("e2e: resolver + provider composed synthesis", async () => {
	const synth = setupIntegration((chart, infraStack, bucket) => {
		const bucketName = bucket.bucket;
		new TerraformOutput(infraStack, "BucketName", { value: bucketName });
		new cdk8s.ApiObject(chart, "configmap", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "app-config" },
			data: { BUCKET_NAME: bucketName },
		});
	}, mockOutputs);

	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("e2e-composed-configmap"),
	);
});

test("e2e: missing stack ID produces error fallback string", () => {
	const synth = setupIntegration(
		(chart, infraStack, bucket) => {
			const bucketName = bucket.bucket;
			new TerraformOutput(infraStack, "BucketName", { value: bucketName });
			new cdk8s.ApiObject(chart, "configmap", {
				apiVersion: "v1",
				kind: "ConfigMap",
				metadata: { name: "app-config" },
				data: { BUCKET_NAME: bucketName },
			});
		},
		() => ({}),
	);

	expect(synth).toContain("Failed fetching value for output");
});

test("e2e: multiple TerraformOutputs resolve into separate ApiObjects", async () => {
	const synth = setupIntegration((chart, infraStack, bucket) => {
		const bucketName = bucket.bucket;
		const bucketArn = bucket.arn;
		new TerraformOutput(infraStack, "BucketName", { value: bucketName });
		new TerraformOutput(infraStack, "BucketArn", { value: bucketArn });
		new cdk8s.ApiObject(chart, "bucket-config", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "bucket-config" },
			data: { BUCKET_NAME: bucketName },
		});
		new cdk8s.ApiObject(chart, "arn-config", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "arn-config" },
			data: { BUCKET_ARN: bucketArn },
		});
	}, mockOutputs);

	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("e2e-multiple-outputs"),
	);
});

test("e2e: escapeTerraformInterpolation fires on resolver-injected values", async () => {
	const synth = setupIntegration(
		(chart, infraStack, bucket) => {
			const bucketName = bucket.bucket;
			new TerraformOutput(infraStack, "BucketName", { value: bucketName });
			new cdk8s.ApiObject(chart, "configmap", {
				apiVersion: "v1",
				kind: "ConfigMap",
				metadata: { name: "app-config" },
				data: { BUCKET_NAME: bucketName },
			});
		},
		() => ({ infra: { BucketName: "bucket-${env}-name" } }),
	);

	await expect(toYaml(synth)).toMatchFileSnapshot(
		snapshotPath("e2e-escaped-interpolation"),
	);
});

test("e2e: resolver caches outputs across multiple ApiObjects in single synth", () => {
	let callCount = 0;
	const fetchOutputsFn = () => {
		callCount++;
		return { infra: { BucketName: "resolved-bucket" } };
	};

	const synth = setupIntegration((chart, infraStack, bucket) => {
		const bucketName = bucket.bucket;
		new TerraformOutput(infraStack, "BucketName", { value: bucketName });
		new cdk8s.ApiObject(chart, "first", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "first" },
			data: { BUCKET_NAME: bucketName },
		});
		new cdk8s.ApiObject(chart, "second", {
			apiVersion: "v1",
			kind: "ConfigMap",
			metadata: { name: "second" },
			data: { BUCKET_NAME: bucketName },
		});
	}, fetchOutputsFn);

	expect(callCount).toBe(1);
	expect(synth).toContain("resolved-bucket");
});
