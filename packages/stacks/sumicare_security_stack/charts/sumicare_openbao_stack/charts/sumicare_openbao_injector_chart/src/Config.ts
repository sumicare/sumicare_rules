/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestOpenbaoInjectorVersion } from "Openbao/Injector/Version";
import {
	defineConfig,
	type InferConfig,
	ProbeSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const injectorConfig = defineConfig({
	chartName: "OpenbaoInjectorChart",
	base: [
		"name",
		"namespace",
		"imagePullPolicy",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	shared: [
		"resourceTier",
		"priorityClassName",
		"livenessProbe",
		"readinessProbe",
		"secretProviderClass",
		"metricsPort",
	],
	fields: {
		enabled: z.boolean().default(true),
		image: z.string().default("openbao/openbao-k8s"),
		version: z.string().default(KnownLatestOpenbaoInjectorVersion),
		agentImage: z.string().default("quay.io/openbao/openbao"),
		agentVersion: z.string().default("2.6.1"),
		replicas: z.number().int().positive().default(2),
		port: z.number().int().positive().default(8080),
		logLevel: z
			.enum(["trace", "debug", "info", "warn", "error"])
			.default("info"),
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
		startupProbe: ProbeSchema.prefault({}),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:v${parsed.version}`,
		agentImage: `${parsed.agentImage}:v${parsed.agentVersion}`,
	}),
});

export const InjectorConfigSchema = injectorConfig.schema;
export const InjectorConfigError = injectorConfig.ConfigError;
export { injectorConfig };

export type Config = InferConfig<typeof injectorConfig>;

export type InjectorChartProps = {
	config: Config;
};
