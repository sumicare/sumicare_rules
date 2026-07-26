/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	defineConfig,
	defineConfigMap,
	ExtraArgsSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const csiConfig = defineConfig({
	chartName: "OpenbaoCsiChart",
	base: [
		"name",
		"namespace",
		"version",
		"image",
		"imagePullPolicy",
		"enabled",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	shared: [
		"resourceTier",
		"tolerations",
		"priorityClassName",
		"nodeSelector",
		"affinity",
	],
	fields: {
		hmacSecretName: z.string().describe("HMAC secret name for CSI provider"),
		debug: z.boolean().describe("Enable debug logging").default(false),
		endpoint: z
			.string()
			.describe("Unix socket endpoint for CSI provider")
			.default("unix:///var/run/vault/vault-csi.sock"),
		providersDir: z
			.string()
			.describe("Host path for CSI provider volumes")
			.default("/etc/kubernetes/providers"),
		healthAddr: z.string().describe("Health probe address").default(":8080"),
		cacheSize: z
			.number()
			.int()
			.describe("Number of secrets to cache")
			.default(10),
		openbaoMount: z.string().describe("Openbao mount path").default(""),
		openbaoNamespace: z.string().describe("Openbao namespace").default(""),
		extraArgs: ExtraArgsSchema.describe("Extra CLI args"),
		agent: z
			.object({
				enabled: z.boolean().default(false),
				image: z.string().default(""),
				logLevel: z.string().default("info"),
				logFormat: z.string().default("standard"),
				extraArgs: ExtraArgsSchema,
				resourceTier: z.enum(["S", "M", "L", "XL"]).default("M"),
			})
			.default({
				enabled: false,
				image: "",
				logLevel: "info",
				logFormat: "standard",
				extraArgs: {},
				resourceTier: "M",
			}),
		updateStrategy: z
			.object({
				type: z.string().default("RollingUpdate"),
				maxUnavailable: z.string().default("1"),
			})
			.default({ type: "RollingUpdate", maxUnavailable: "1" }),
	},
});

export const CsiConfigSchema = csiConfig.schema;
export const CsiConfigError = csiConfig.ConfigError;
export const CsiConfigMap = defineConfigMap(
	{
		component: "csi",
		name: (c) => `${c.name}-csi-provider-agent-config`,
		dataSchema: z.object({
			"config.hcl": z.string(),
		}),
		map: (c) => {
			const agentAddr = `https://${c.name}.${c.namespace}.svc:8200`;
			return {
				"config.hcl": [
					`vault {`,
					`    "address" = "${agentAddr}"`,
					`}`,
					``,
					`cache {}`,
					``,
					`listener "unix" {`,
					`    address = "/var/run/vault/agent.sock"`,
					`    tls_disable = true`,
					`}`,
				].join("\n"),
			};
		},
	},
	CsiConfigError,
);
export type CsiConfig = z.infer<typeof CsiConfigSchema>;

export type CsiChartProps = {
	config: CsiConfig;
};
