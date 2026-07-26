/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	defineConfig,
	defineConfigMap,
	ProbeSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const serverConfig = defineConfig({
	chartName: "OpenbaoServerChart",
	base: [
		"name",
		"namespace",
		"version",
		"image",
		"imagePullPolicy",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	shared: ["resourceTier", "priorityClassName"],
	fields: {
		replicas: z.number().int().positive().default(3),
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
		logLevel: z
			.enum(["trace", "debug", "info", "warn", "error"])
			.default("info"),
		logFormat: z.enum(["standard", "json"]).default("standard"),
		config: z.string().optional(),
		preStopSleepSeconds: z.number().int().nonnegative().default(5),
		hostNetwork: z.boolean().default(false),
		shareProcessNamespace: z.boolean().default(false),
	},
});

export const ServerConfigSchema = serverConfig.schema;
export const ServerConfigError = serverConfig.ConfigError;
export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export const ServerConfigMap = defineConfigMap<ServerConfig>(
	{
		component: "server",
		name: (c) => `${c.name}-config`,
		dataSchema: z.object({
			"openbao.json": z.string(),
		}),
		map: (c) => {
			const listenerConfig = JSON.stringify(
				{
					listener: [
						{
							tcp: {
								address: "0.0.0.0:8200",
								tls_disable: 1,
							},
						},
					],
				},
				null,
				2,
			);

			const storageConfig = c.ha.enabled
				? JSON.stringify(
						{
							storage: [
								{
									raft: {
										path: "/openbao/data",
										node_id: "openbao-0",
									},
								},
							],
						},
						null,
						2,
					)
				: JSON.stringify(
						{ storage: [{ file: { path: "/openbao/data" } }] },
						null,
						2,
					);

			return {
				"openbao.json": `# OpenBao server configuration\n${listenerConfig}\n${storageConfig}\n`,
			};
		},
	},
	ServerConfigError,
);

export type ServerChartProps = {
	config: ServerConfig;
};
