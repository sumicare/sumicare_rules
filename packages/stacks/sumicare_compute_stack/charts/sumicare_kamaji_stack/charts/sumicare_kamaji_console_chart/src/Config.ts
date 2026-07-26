/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiConsoleVersion } from "Kamaji/Console/Version";
import {
	defineConfig,
	type InferConfig,
	OpenBaoSpcSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const SveltosSchema = z.object({
	url: z.string().default(""),
	namespace: z.string().optional(),
	secretName: z.string().optional(),
});

const CredentialsSecretSchema = z.object({
	generate: z.boolean().default(false),
	name: z.string().default("kamaji-console"),
	nextAuthUrl: z.string().default(""),
	jwtSecret: z.string().default(""),
	email: z.string().default(""),
	password: z.string().default(""),
});

const IngressHostSchema = z.object({
	host: z.string(),
	path: z.string().default("/ui"),
	pathType: z
		.enum(["ImplementationSpecific", "Exact", "Prefix"])
		.default("ImplementationSpecific"),
});

const IngressTlsSchema = z.object({
	secretName: z.string(),
	hosts: z.array(z.string()).default([]),
});

const IngressSchema = z.object({
	enabled: z.boolean().default(false),
	className: z.string().default(""),
	annotations: z.record(z.string(), z.string()).default({}),
	hosts: z.array(IngressHostSchema).default([]),
	tls: z.array(IngressTlsSchema).default([]),
});

const kamajiConsoleConfig = defineConfig({
	chartName: "KamajiConsoleChart",
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
			.describe("Base name for Kamaji Console resources")
			.default("kamaji-console"),
		namespace: z
			.string()
			.describe("Kubernetes namespace")
			.default("kamaji-system"),
		image: z
			.string()
			.describe("Kamaji Console image repository")
			.default("ghcr.io/clastix/kamaji-console"),
		version: z
			.string()
			.describe("Kamaji Console image version")
			.default(KnownLatestKamajiConsoleVersion),
		imagePullPolicy: z
			.enum(["Always", "IfNotPresent", "Never"])
			.default("Always"),
		replicas: z.number().min(1).default(2),
		sveltos: SveltosSchema.prefault({}),
		credentialsSecret: CredentialsSecretSchema.prefault({}),
		ingress: IngressSchema.prefault({}),
		metricsPort: z
			.number()
			.min(1)
			.max(65535)
			.describe("Port for the HTTPS metrics endpoint")
			.default(3000),
		secretProviderClass: OpenBaoSpcSchema.prefault({}).describe(
			"OpenBao CSI SecretProviderClass configuration for HTTPS metrics certs",
		),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:${parsed.version}`,
	}),
});

export const KamajiConsoleConfigSchema = kamajiConsoleConfig.schema;
export const KamajiConsoleConfigError = kamajiConsoleConfig.ConfigError;
export { kamajiConsoleConfig };

export type Config = InferConfig<typeof kamajiConsoleConfig>;
