/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ChartConfigError } from "Commons/Config/ChartBuilder";
import {
	ContainerSecurityContextSchema,
	PodSecurityContextSchema,
	ProbeSchema,
	ResourceTierSchema,
} from "Commons/Config/Schemas";
import { HpaConfigSchema, VpaConfigSchema } from "Commons/Crds/Autoscaling";
import {
	CiliumPolicyConfigSchema,
	DexAuthConfigSchema,
	GatewayConfigSchema,
	HttpRouteConfigSchema,
	IngressConfigSchema,
	IstioAuthConfigSchema,
	IstioMeshConfigSchema,
	NetbirdConfigSchema,
} from "Commons/Crds/Networking";
import {
	PodMonitorConfigSchema,
	PrometheusRuleConfigSchema,
	ServiceMonitorConfigSchema,
} from "Commons/Crds/Observability";
import { PdbConfigSchema } from "Commons/Crds/Policies";
import { OpenBaoSpcSchema } from "Commons/Crds/Security";
import { z } from "zod";

/** Predefined Zod schemas for common chart config base fields. */
export const BASE_FIELD_SCHEMAS = {
	name: z.string().describe("Base name for resources").default(""),
	namespace: z.string().describe("Kubernetes namespace").default("default"),
	version: z.string().describe("Container image version").default("latest"),
	image: z.string().describe("Container image").default(""),
	imagePullPolicy: z
		.enum(["Always", "IfNotPresent", "Never"])
		.describe("Image pull policy")
		.default("IfNotPresent"),
	runAsUser: z.number().int().describe("Container runAsUser").default(65534),
	runAsGroup: z.number().int().describe("Container runAsGroup").default(65534),
	fsGroup: z.number().int().describe("Pod fsGroup").default(65534),
	revisionHistoryLimit: z
		.number()
		.int()
		.describe("Number of old ReplicaSets to retain")
		.default(10),
	enabled: z.boolean().describe("Whether the chart is enabled").default(true),
} as const;

/** Keys available in {@link BASE_FIELD_SCHEMAS}. */
export type BaseFieldKey = keyof typeof BASE_FIELD_SCHEMAS;

/** Predefined Zod schemas for shared feature fields selectable by charts. */
export const SHARED_FIELD_SCHEMAS = {
	// ── Scheduling ───────────────────────────────────────────────────
	resourceTier: ResourceTierSchema.describe(
		"Resource tier (S, M, L, XL)",
	).default("M"),
	tolerations: z.array(z.any()).describe("Pod tolerations").default([]),
	priorityClassName: z.string().describe("Priority class name").optional(),
	nodeSelector: z
		.record(z.string(), z.string())
		.describe("Pod node selector")
		.default({}),
	affinity: z.any().describe("Pod affinity rules").optional(),

	// ── Probes ───────────────────────────────────────────────────────
	livenessProbe: ProbeSchema.prefault({}).describe(
		"Liveness probe configuration",
	),
	readinessProbe: ProbeSchema.prefault({}).describe(
		"Readiness probe configuration",
	),

	// ── Autoscaling ──────────────────────────────────────────────────
	vpa: VpaConfigSchema.prefault({}).describe(
		"VerticalPodAutoscaler configuration for automatic CPU/memory request adjustment",
	),
	hpa: HpaConfigSchema.prefault({}).describe(
		"HorizontalPodAutoscaler configuration for CPU/memory-based horizontal scaling",
	),

	// ── Security ─────────────────────────────────────────────────────
	secretProviderClass: OpenBaoSpcSchema.prefault({}).describe(
		"OpenBao CSI SecretProviderClass configuration for fetching TLS certificates from OpenBao PKI",
	),
	podSecurityContext: PodSecurityContextSchema.prefault({}).describe(
		"Pod-level security context with hardened defaults (non-root, seccomp RuntimeDefault)",
	),
	securityContext: ContainerSecurityContextSchema.prefault({}).describe(
		"Container-level security context with hardened defaults (read-only rootfs, drop ALL caps, no privilege escalation)",
	),

	// ── Networking ───────────────────────────────────────────────────
	ciliumPolicy: CiliumPolicyConfigSchema.prefault({}).describe(
		"Cilium NetworkPolicy configuration for L3/L4 ingress and egress filtering",
	),
	istioMesh: IstioMeshConfigSchema.prefault({}).describe(
		"Istio ambient mesh configuration for zero-trust mTLS",
	),
	istioAuth: IstioAuthConfigSchema.prefault({}).describe(
		"Istio AuthorizationPolicy restricting endpoint access to specified principals",
	),
	ingress: IngressConfigSchema.prefault({}).describe(
		"Standard Kubernetes Ingress configuration",
	),
	httpRoute: HttpRouteConfigSchema.prefault({}).describe(
		"Gateway API HTTPRoute configuration",
	),
	gateway: GatewayConfigSchema.prefault({}).describe(
		"Gateway API Gateway configuration",
	),
	netbird: NetbirdConfigSchema.prefault({}).describe(
		"Netbird NetworkResource configuration",
	),
	dexAuth: DexAuthConfigSchema.prefault({}).describe(
		"Dex OIDC authentication via KGateway GatewayExtension",
	),

	// ── Observability ────────────────────────────────────────────────
	serviceMonitor: ServiceMonitorConfigSchema.prefault({}).describe(
		"Prometheus ServiceMonitor configuration",
	),
	podMonitor: PodMonitorConfigSchema.prefault({}).describe(
		"Prometheus PodMonitor configuration",
	),
	prometheusRule: PrometheusRuleConfigSchema.prefault({}).describe(
		"PrometheusRule configuration for alerting",
	),
	disableMetrics: z
		.boolean()
		.describe("Disable the /metrics Prometheus endpoint and ServiceMonitor")
		.default(false),

	// ── Resilience ───────────────────────────────────────────────────
	pdb: PdbConfigSchema.prefault({}).describe(
		"PodDisruptionBudget configuration",
	),

	// ── Multi-Component ──────────────────────────────────────────────
	environments: z
		.array(z.string())
		.describe(
			"Environments where PDBs are created (e.g. prod, staging). PDBs are skipped for environments not in this list",
		)
		.default(["prod", "staging"]),
	metricsPort: z
		.number()
		.int()
		.min(1)
		.max(65535)
		.describe("Port for the HTTPS metrics endpoint")
		.default(8080),
} as const;

/** Keys available in {@link SHARED_FIELD_SCHEMAS}. */
export type SharedFieldKey = keyof typeof SHARED_FIELD_SCHEMAS;

/** Combined Zod raw shape from base, shared, and chart-specific fields. */
type CombinedShape<
	B extends readonly BaseFieldKey[],
	S extends readonly SharedFieldKey[],
	F extends z.ZodRawShape,
> = { [K in B[number]]: (typeof BASE_FIELD_SCHEMAS)[K] } & {
	[K in S[number]]: (typeof SHARED_FIELD_SCHEMAS)[K];
} & F;

/** Result of {@link defineConfig}. */
export type DefineConfigResult<C extends z.ZodTypeAny, N extends string, R> = {
	schema: C;
	ConfigError: new (id: string, error: z.core.$ZodError) => ChartConfigError;
	Config: R;
	chartName: N;
	resolveConfig?: (parsed: Record<string, unknown>) => Record<string, unknown>;
};

/** Extracts the resolved Config type from a {@link defineConfig} return value. */
export type InferConfig<T> =
	T extends DefineConfigResult<z.ZodTypeAny, string, infer R> ? R : never;

/** Options for {@link defineConfig}. */
export type DefineConfigOptions<
	B extends readonly BaseFieldKey[],
	S extends readonly SharedFieldKey[],
	F extends z.ZodRawShape,
	N extends string,
	R,
> = {
	chartName: N;
	base?: B;
	shared?: S;
	fields: F;
	resolveConfig?: (parsed: z.infer<z.ZodObject<CombinedShape<B, S, F>>>) => R;
};

/**
 * Creates a standardized chart config from selectable base fields, shared
 * feature fields, and chart-specific Zod fields.
 *
 * Returns a Zod schema, a typed `Config` alias, and a `ConfigError` class.
 *
 * When `resolveConfig` is provided, the returned `Config` type reflects the
 * transformed output (e.g. with resolved image strings). Otherwise `Config`
 * is the raw inferred schema type.
 *
 * @example
 * const { schema, ConfigError } = defineConfig({
 *   chartName: "OpenbaoSnapshotChart",
 *   base: ["name", "namespace", "version", "image", "imagePullPolicy", "enabled"],
 *   shared: ["resourceTier"],
 *   fields: {
 *     schedule: z.string(),
 *     s3: z.object({ host: z.string(), bucket: z.string(), uri: z.string() }),
 *   },
 * });
 */
export const defineConfig = <
	B extends readonly BaseFieldKey[] = readonly [],
	S extends readonly SharedFieldKey[] = readonly [],
	F extends z.ZodRawShape = z.ZodRawShape,
	N extends string = string,
	R = z.infer<z.ZodObject<CombinedShape<B, S, F>>>,
>(
	opts: DefineConfigOptions<B, S, F, N, R>,
): DefineConfigResult<z.ZodObject<CombinedShape<B, S, F>>, N, R> => {
	const baseShape = Object.fromEntries(
		(opts.base ?? []).map((k) => [k, BASE_FIELD_SCHEMAS[k]]),
	);
	const sharedShape = Object.fromEntries(
		(opts.shared ?? []).map((k) => [k, SHARED_FIELD_SCHEMAS[k]]),
	);
	const fullSchema = z.object({
		...baseShape,
		...sharedShape,
		...opts.fields,
	});

	class ConfigError extends ChartConfigError {
		constructor(id: string, error: z.core.$ZodError) {
			super(opts.chartName, id, error);
			this.name = `${opts.chartName}ConfigError`;
		}
	}

	const resolveConfig = opts.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined;

	return {
		schema: fullSchema as z.ZodObject<CombinedShape<B, S, F>>,
		ConfigError,
		Config: undefined as unknown as R,
		chartName: opts.chartName,
		resolveConfig,
	};
};
