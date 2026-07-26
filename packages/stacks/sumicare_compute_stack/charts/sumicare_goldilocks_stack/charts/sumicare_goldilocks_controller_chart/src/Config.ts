/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestGoldilocksVersion } from "Goldilocks/Controller/Version";
import { defineConfig, type InferConfig } from "@sumicare/chart-commons";
import { z } from "zod";

const FlagsSchema = z
	.record(z.string(), z.union([z.string(), z.boolean(), z.number()]))
	.default({});

const goldilocksControllerConfig = defineConfig({
	chartName: "GoldilocksControllerChart",
	base: ["revisionHistoryLimit"],
	shared: [
		"resourceTier",
		"livenessProbe",
		"readinessProbe",
		"nodeSelector",
		"tolerations",
		"secretProviderClass",
		"vpa",
		"hpa",
		"disableMetrics",
		"metricsPort",
	],
	fields: {
		name: z
			.string()
			.describe("Base name for Goldilocks resources")
			.default("goldilocks"),
		namespace: z
			.string()
			.describe("Kubernetes namespace where Goldilocks will be deployed")
			.default("goldilocks"),
		version: z
			.string()
			.describe("Goldilocks container image version (without v prefix)")
			.default(KnownLatestGoldilocksVersion),
		image: z
			.string()
			.describe("Goldilocks container image repository")
			.default("us-docker.pkg.dev/fairwinds-ops/oss/goldilocks"),
		imagePullPolicy: z
			.enum(["Always", "IfNotPresent", "Never"])
			.default("Always"),
		logVerbosity: z.string().regex(/^\d+$/).default("2"),
		flags: FlagsSchema,
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:v${parsed.version}`,
	}),
});

export const GoldilocksControllerConfigSchema =
	goldilocksControllerConfig.schema;
export const GoldilocksControllerConfigError =
	goldilocksControllerConfig.ConfigError;
export { goldilocksControllerConfig };

export type Config = InferConfig<typeof goldilocksControllerConfig>;
