/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiVersion } from "Kamaji/KubeconfigGenerator/Version";
import {
	DurationSchema,
	defineConfig,
	ExtraArgsSchema,
	type InferConfig,
	OpenBaoSpcSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const kamajiKubeconfigGeneratorConfig = defineConfig({
	chartName: "KamajiKubeconfigGeneratorChart",
	shared: [
		"resourceTier",
		"livenessProbe",
		"readinessProbe",
		"nodeSelector",
		"tolerations",
		"affinity",
	],
	fields: {
		name: z
			.string()
			.describe("Base name for the Kubeconfig Generator resources")
			.default("kamaji-kubeconfig-generator"),
		namespace: z
			.string()
			.describe("Kubernetes namespace")
			.default("kamaji-system"),
		version: z
			.string()
			.describe("Kamaji container image version (without v prefix)")
			.default(KnownLatestKamajiVersion),
		image: z
			.string()
			.describe("Kamaji controller image repository")
			.default("clastix/kamaji"),
		imagePullPolicy: z
			.enum(["Always", "IfNotPresent", "Never"])
			.default("Always"),
		replicas: z.number().min(1).default(2),
		metricsBindAddress: z.string().default(":8090"),
		healthProbeBindAddress: z.string().default(":8091"),
		enableLeaderElect: z.boolean().default(true),
		controllerReconcileTimeout: DurationSchema.describe(
			"Reconciliation request timeout",
		).default("30s"),
		cacheResyncPeriod: DurationSchema.describe(
			"Controller-runtime cache resync period",
		).default("10h"),
		certificateExpirationDeadline: DurationSchema.describe(
			"Deadline before cert expiration to start renewal (min 24h)",
		).default("24h"),
		loggingDevel: z
			.boolean()
			.describe("Enable zap development mode")
			.default(false),
		extraArgs: ExtraArgsSchema.describe(
			"Additional CLI arguments appended to the kubeconfig-generator command",
		),
		metricsPort: z
			.number()
			.min(1)
			.max(65535)
			.describe("Port for the HTTPS metrics endpoint")
			.default(8090),
		secretProviderClass: OpenBaoSpcSchema.prefault({}).describe(
			"OpenBao CSI SecretProviderClass configuration for HTTPS metrics certs",
		),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:${parsed.version}`,
	}),
});

export const KamajiKubeconfigGeneratorConfigSchema =
	kamajiKubeconfigGeneratorConfig.schema;
export const KamajiKubeconfigGeneratorConfigError =
	kamajiKubeconfigGeneratorConfig.ConfigError;
export { kamajiKubeconfigGeneratorConfig };

export type Config = InferConfig<typeof kamajiKubeconfigGeneratorConfig>;
