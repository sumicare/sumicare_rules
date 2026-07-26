/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiVersion } from "Kamaji/Controller/Version";
import {
	DurationSchema,
	defineConfig,
	ExtraArgsSchema,
	type InferConfig,
	OpenBaoSpcSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const kamajiControllerConfig = defineConfig({
	chartName: "KamajiControllerChart",
	base: ["revisionHistoryLimit"],
	shared: [
		"resourceTier",
		"livenessProbe",
		"readinessProbe",
		"nodeSelector",
		"tolerations",
		"priorityClassName",
		"metricsPort",
		"environments",
	],
	fields: {
		name: z
			.string()
			.describe("Base name for Kamaji controller resources")
			.default("kamaji"),
		namespace: z
			.string()
			.describe("Kubernetes namespace where Kamaji controller will be deployed")
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
		replicas: z.number().min(1).default(1),
		defaultDatastoreName: z
			.string()
			.describe(
				"Default DataStore name for TCPs without an explicit DataStore (empty = no default)",
			)
			.default("default"),
		kineImage: z
			.string()
			.describe(
				"Container image for the Kine sidecar (used with kine storage strategies)",
			)
			.default("rancher/kine:v0.11.10-amd64"),
		migrateImage: z
			.string()
			.describe(
				"Container image launched when migrating a TCP to a new datastore",
			)
			.default(""),
		maxConcurrentReconciles: z
			.number()
			.min(1)
			.describe("Number of workers for the Tenant Control Plane controller")
			.default(1),
		metricsBindAddress: z.string().default(":8080"),
		healthProbeBindAddress: z.string().default(":8081"),
		pprofBindAddress: z
			.string()
			.describe("Address the pprof profiler binds to (empty = disabled)")
			.default(""),
		tmpDirectory: z.string().default("/tmp/kamaji"),
		controllerReconcileTimeout: DurationSchema.describe(
			"Reconciliation request timeout before withdrawing external resource calls",
		).default("30s"),
		cacheResyncPeriod: DurationSchema.describe(
			"Controller-runtime cache resync period",
		).default("10h"),
		certificateExpirationDeadline: DurationSchema.describe(
			"Deadline before cert expiration to start renewal (min 24h)",
		).default("24h"),
		webhookServiceName: z
			.string()
			.describe("Kamaji webhook server Service name (for migration jobs)")
			.default("kamaji-webhook-service"),
		webhookCaPath: z
			.string()
			.describe("Path to the webhook server CA certificate")
			.default("/tmp/k8s-webhook-server/serving-certs/ca.crt"),
		telemetryDisabled: z
			.boolean()
			.describe("Disable Kamaji analytics traces collection")
			.default(false),
		loggingDevel: z
			.boolean()
			.describe("Enable zap development mode (console encoder, debug level)")
			.default(false),
		extraArgs: ExtraArgsSchema.describe(
			"Additional CLI arguments appended to the manager command",
		),
		runAsUser: z.number().default(65532),
		runAsGroup: z.number().default(65532),
		fsGroup: z.number().default(65532),
		serviceMonitor: z
			.object({
				enabled: z
					.boolean()
					.describe(
						"Enable Prometheus ServiceMonitor (requires Prometheus Operator)",
					)
					.default(false),
				interval: z.string().default("30s"),
				labels: z.record(z.string(), z.string()).default({}),
			})
			.prefault({}),
		secretProviderClass: OpenBaoSpcSchema.extend({
			vaultAddress: z
				.string()
				.describe(
					"OpenBao server URL, e.g. https://openbao.vault-system.svc:8200",
				)
				.default("https://openbao.vault-system.svc:8200"),
			vaultRole: z
				.string()
				.describe("OpenBao Kubernetes auth role for the Kamaji controller SA")
				.default("kamaji-webhook"),
			pkiPath: z
				.string()
				.describe(
					"OpenBao PKI issue endpoint path, e.g. pki/issue/kamaji-webhook",
				)
				.default("pki/issue/kamaji-webhook"),
		})
			.prefault({})
			.describe(
				"OpenBao CSI SecretProviderClass configuration for fetching TLS certificates from OpenBao PKI",
			),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:${parsed.version}`,
	}),
});

export const KamajiControllerConfigSchema = kamajiControllerConfig.schema;
export const KamajiControllerConfigError = kamajiControllerConfig.ConfigError;
export { kamajiControllerConfig };

export type Config = InferConfig<typeof kamajiControllerConfig>;
