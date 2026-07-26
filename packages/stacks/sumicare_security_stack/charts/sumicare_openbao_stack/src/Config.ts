/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	defineConfig,
	ExtraArgsSchema,
	type InferConfig,
	OpenBaoSpcSchema,
	ProbeSchema,
	ResourceTierSchema,
} from "@sumicare/chart-commons";
import { KnownLatestOpenbaoCsiVersion } from "@sumicare/chart-security-openbao-csi";
import { KnownLatestOpenbaoInjectorVersion } from "@sumicare/chart-security-openbao-injector";
import { KnownLatestOpenbaoServerVersion } from "@sumicare/chart-security-openbao-server";
import { KnownLatestOpenbaoSnapshotVersion } from "@sumicare/chart-security-openbao-snapshot";
import { z } from "zod";

const ServerSchema = z.object({
	image: z.string().default("quay.io/openbao/openbao"),
	version: z.string().default(KnownLatestOpenbaoServerVersion),
	replicas: z.number().int().positive().default(3),
	resourceTier: ResourceTierSchema.default("M"),
	probes: ProbeSchema.prefault({}),
	storage: z
		.object({
			size: z.string().default("10Gi"),
			storageClass: z.string().optional(),
		})
		.prefault({}),
	ha: z
		.object({
			enabled: z.boolean().default(true),
			replicas: z.number().int().positive().default(3),
			raft: z
				.object({
					enabled: z.boolean().default(true),
					setNodeId: z.boolean().default(true),
				})
				.prefault({}),
		})
		.prefault({}),
	serviceType: z
		.enum(["ClusterIP", "NodePort", "LoadBalancer"])
		.default("ClusterIP"),
	logLevel: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
	logFormat: z.enum(["standard", "json"]).default("standard"),
	config: z.string().optional(),
	priorityClassName: z.string().default(""),
	preStopSleepSeconds: z.number().int().nonnegative().default(5),
	hostNetwork: z.boolean().default(false),
	shareProcessNamespace: z.boolean().default(false),
});

const InjectorSchema = z.object({
	enabled: z.boolean().default(true),
	image: z.string().default("openbao/openbao-k8s"),
	version: z.string().default(KnownLatestOpenbaoInjectorVersion),
	agentImage: z.string().default("quay.io/openbao/openbao"),
	agentVersion: z.string().default(KnownLatestOpenbaoServerVersion),
	replicas: z.number().int().positive().default(2),
	port: z.number().int().positive().default(8080),
	logLevel: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
	logFormat: z.enum(["standard", "json"]).default("standard"),
	failurePolicy: z.enum(["Ignore", "Fail"]).default("Ignore"),
	authPath: z.string().default("auth/kubernetes"),
	revokeOnShutdown: z.boolean().default(false),
	metrics: z
		.object({
			enabled: z.boolean().default(false),
		})
		.prefault({}),
	leaderElector: z
		.object({
			enabled: z.boolean().default(true),
		})
		.prefault({}),
	hostNetwork: z.boolean().default(false),
	priorityClassName: z.string().default(""),
	agentDefaults: z
		.object({
			cpuRequest: z.string().default("250m"),
			cpuLimit: z.string().default("500m"),
			memRequest: z.string().default("64Mi"),
			memLimit: z.string().default("128Mi"),
			ephemeralRequest: z.string().default(""),
			ephemeralLimit: z.string().default(""),
			template: z.string().default("map"),
			templateConfig: z
				.object({
					exitOnRetryFailure: z.boolean().default(true),
					staticSecretRenderInterval: z.string().default(""),
				})
				.prefault({}),
		})
		.prefault({}),
	certs: z
		.object({
			secretName: z.string().default(""),
			certName: z.string().default("tls.crt"),
			keyName: z.string().default("tls.key"),
		})
		.prefault({}),
	resourceTier: ResourceTierSchema.default("S"),
	metricsPort: z
		.number()
		.int()
		.min(1)
		.max(65535)
		.describe("Port for the HTTPS metrics endpoint")
		.default(8080),
	livenessProbe: ProbeSchema.prefault({}),
	readinessProbe: ProbeSchema.prefault({}),
	startupProbe: ProbeSchema.prefault({}),
	secretProviderClass: OpenBaoSpcSchema.prefault({}).describe(
		"OpenBao CSI SecretProviderClass configuration for HTTPS metrics certs",
	),
});

const CsiSchema = z.object({
	enabled: z.boolean().default(true),
	image: z.string().default("quay.io/openbao/openbao-csi-provider"),
	version: z.string().default(KnownLatestOpenbaoCsiVersion),
	namespace: z.string().default("csi"),
	hmacSecretName: z.string().default("openbao-csi-provider-hmac-key"),
	debug: z.boolean().default(false),
	endpoint: z.string().default("/provider/openbao.sock"),
	providersDir: z
		.string()
		.default("/etc/kubernetes/secrets-store-csi-providers"),
	healthAddr: z.string().default(":8080"),
	cacheSize: z.number().int().positive().default(1000),
	openbaoMount: z.string().default("kubernetes"),
	openbaoNamespace: z.string().default(""),
	extraArgs: ExtraArgsSchema,
	priorityClassName: z.string().default(""),
	tolerations: z.array(z.unknown()).default([]),
	nodeSelector: z.record(z.string(), z.string()).default({}),
	affinity: z.unknown().default(null),
	resourceTier: ResourceTierSchema.default("S"),
	agent: z
		.object({
			enabled: z.boolean().default(false),
			image: z.string().default("quay.io/openbao/openbao"),
			logLevel: z.string().default("info"),
			logFormat: z.string().default("standard"),
			extraArgs: ExtraArgsSchema,
			resourceTier: ResourceTierSchema.default("S"),
		})
		.prefault({}),
	updateStrategy: z
		.object({
			type: z.string().default("RollingUpdate"),
			maxUnavailable: z.string().default(""),
		})
		.prefault({}),
});

const SnapshotAgentSchema = z.object({
	enabled: z.boolean().default(false),
	image: z.string().default("ghcr.io/openbao/openbao-snapshot-agent"),
	version: z.string().default(KnownLatestOpenbaoSnapshotVersion),
	schedule: z.string().default("0 * * * *"),
	restartPolicy: z.enum(["Never", "OnFailure"]).default("Never"),
	s3: z.object({
		host: z.string(),
		bucket: z.string(),
		uri: z.string(),
		expireDays: z.string().optional(),
		extraFlag: z.string().optional(),
	}),
	bao: z
		.object({
			addr: z.string().default("https://openbao.vault-system.svc:8200"),
			authPath: z.string().default("kubernetes"),
			role: z.string().default("bao-raft-snapshot"),
		})
		.prefault({}),
	credentialsSecret: z.string().default("bao-snapshot-credentials"),
	resourceTier: ResourceTierSchema.default("S"),
	tolerations: z.array(z.unknown()).default([]),
});

const MonitoringSchema = z.object({
	serviceMonitors: z
		.object({
			enabled: z.boolean().default(false),
		})
		.prefault({}),
	prometheusRules: z
		.object({
			enabled: z.boolean().default(false),
		})
		.prefault({}),
});

const NetworkPolicySchema = z
	.object({
		enabled: z.boolean().default(false),
	})
	.prefault({});

const openbaoStackConfig = defineConfig({
	chartName: "OpenbaoStack",
	base: [
		"name",
		"namespace",
		"imagePullPolicy",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	fields: {
		name: z
			.string()
			.describe("Base name for OpenBao resources")
			.default("openbao"),
		namespace: z
			.string()
			.describe("Kubernetes namespace for OpenBao")
			.default("openbao"),
		server: ServerSchema.prefault({}),
		injector: InjectorSchema.prefault({}),
		csi: CsiSchema.prefault({}),
		snapshotAgent: SnapshotAgentSchema.optional(),
		monitoring: MonitoringSchema.prefault({}),
		networkPolicy: NetworkPolicySchema.prefault({}),
	},
});

export const OpenbaoStackConfigSchema = openbaoStackConfig.schema;
export const OpenbaoConfigError = openbaoStackConfig.ConfigError;
export { openbaoStackConfig };

export type Config = InferConfig<typeof openbaoStackConfig>;
