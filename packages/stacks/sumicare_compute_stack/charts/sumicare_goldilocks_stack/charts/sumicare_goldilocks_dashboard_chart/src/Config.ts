/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestGoldilocksVersion } from "Goldilocks/Dashboard/Version";
import {
	DexAuthConfigSchema,
	defineConfig,
	type InferConfig,
	IstioAuthConfigSchema,
	IstioMeshConfigSchema,
	OpenBaoSpcSchema,
} from "@sumicare/chart-commons";
import { z } from "zod";

const FlagsSchema = z
	.record(z.string(), z.union([z.string(), z.boolean(), z.number()]))
	.default({});

const HealthCheckPolicySchema = z.object({
	enabled: z.boolean().default(false),
	requestPath: z.string().default("/health"),
});

const IstioMeshSchema = IstioMeshConfigSchema.extend({
	peerAuthentication: z
		.object({
			enabled: z.boolean().default(true),
			mtlsMode: z
				.enum(["UNSET", "DISABLE", "PERMISSIVE", "STRICT"])
				.default("PERMISSIVE"),
		})
		.prefault({}),
});

const SecretProviderClassSchema = OpenBaoSpcSchema.extend({
	vaultRole: z
		.string()
		.describe("OpenBao Kubernetes auth role for the Goldilocks dashboard SA")
		.default("goldilocks-dashboard"),
	pkiPath: z
		.string()
		.describe(
			"OpenBao PKI issue endpoint path, e.g. pki/issue/goldilocks-dashboard",
		)
		.default("pki/issue/goldilocks-dashboard"),
});

const IstioAuthSchema = IstioAuthConfigSchema.extend({
	jwtRules: z
		.array(
			z.object({
				issuer: z
					.string()
					.describe("JWT issuer (must match Dex issuer URI)")
					.default("https://dex.dex.svc:5556/dex"),
				jwksUri: z
					.string()
					.describe("JWKS URI for key validation")
					.default("https://dex.dex.svc:5556/dex/keys"),
				audiences: z.array(z.string()).default(["goldilocks"]),
				fromHeaders: z
					.array(
						z.object({
							name: z.string().default("Authorization"),
							prefix: z.string().default("Bearer "),
						}),
					)
					.default([{ name: "Authorization", prefix: "Bearer " }]),
			}),
		)
		.default([]),
});

const DexAuthSchema = DexAuthConfigSchema.extend({
	clientId: z
		.string()
		.describe("OAuth2 client ID registered in Dex")
		.default("goldilocks"),
});

const goldilocksDashboardConfig = defineConfig({
	chartName: "GoldilocksDashboardChart",
	base: ["revisionHistoryLimit"],
	shared: [
		"resourceTier",
		"livenessProbe",
		"readinessProbe",
		"nodeSelector",
		"tolerations",
		"ingress",
		"httpRoute",
		"gateway",
		"netbird",
		"ciliumPolicy",
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
		replicas: z.number().min(1).default(2),
		basePath: z.string().optional(),
		logVerbosity: z.string().regex(/^\d+$/).default("2"),
		excludeContainers: z.string().default("linkerd-proxy,istio-proxy"),
		flags: FlagsSchema,
		service: z
			.object({
				type: z
					.enum(["ClusterIP", "NodePort", "LoadBalancer"])
					.default("ClusterIP"),
				port: z.number().min(1).max(65535).default(80),
				annotations: z.record(z.string(), z.string()).default({}),
			})
			.prefault({}),
		healthCheckPolicy: HealthCheckPolicySchema.prefault({}),
		istioMesh: IstioMeshSchema.prefault({}),
		secretProviderClass: SecretProviderClassSchema.prefault({}).describe(
			"OpenBao CSI SecretProviderClass configuration for fetching TLS certificates from OpenBao PKI for the Goldilocks dashboard",
		),
		dexAuth: DexAuthSchema.prefault({}),
		istioAuth: IstioAuthSchema.prefault({}),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:v${parsed.version}`,
	}),
});

export const GoldilocksDashboardConfigSchema = goldilocksDashboardConfig.schema;
export const GoldilocksDashboardConfigError =
	goldilocksDashboardConfig.ConfigError;
export { goldilocksDashboardConfig };

export type Config = InferConfig<typeof goldilocksDashboardConfig>;
