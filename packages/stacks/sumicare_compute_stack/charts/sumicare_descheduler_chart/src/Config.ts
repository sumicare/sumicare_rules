/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestDeschedulerVersion } from "Compute/Descheduler/Version";
import {
	DurationSchema,
	defineConfig,
	defineConfigMap,
	type InferConfig,
	OpenBaoSpcSchema,
} from "@sumicare/chart-commons";
import { stringify } from "yaml";
import { z } from "zod";

const NamespacesSchema = z.object({
	include: z.array(z.string()).optional(),
	exclude: z.array(z.string()).optional(),
});

const ResourceThresholdsSchema = z
	.record(
		z.string(),
		z
			.number()
			.min(0, "threshold not in [0, 100] range")
			.max(100, "threshold not in [0, 100] range"),
	)
	.refine(
		(v) => Object.keys(v).length > 0,
		"no resource threshold is configured",
	);

const DefaultDisabledSchema = z.enum([
	"PodsWithLocalStorage",
	"DaemonSetPods",
	"SystemCriticalPods",
	"FailedBarePods",
]);

const ExtraEnabledSchema = z.enum([
	"PodsWithPVC",
	"PodsWithoutPDB",
	"PodsWithResourceClaims",
]);

const PluginNameSchema = z.enum([
	"DefaultEvictor",
	"RemoveDuplicates",
	"RemovePodsHavingTooManyRestarts",
	"RemovePodsViolatingNodeAffinity",
	"RemovePodsViolatingNodeTaints",
	"RemovePodsViolatingInterPodAntiAffinity",
	"RemovePodsViolatingTopologySpreadConstraint",
	"LowNodeUtilization",
	"HighNodeUtilization",
	"PodLifeTime",
	"RemoveFailedPods",
]);

const PluginSetSchema = z.object({
	enabled: z.array(PluginNameSchema),
	disabled: z.array(PluginNameSchema).optional(),
});

const LabelSelectorSchema = z.object({
	matchLabels: z.record(z.string(), z.string()).optional(),
	matchExpressions: z
		.array(
			z.object({
				key: z.string(),
				operator: z.enum(["In", "NotIn", "Exists", "DoesNotExist"]),
				values: z.array(z.string()).optional(),
			}),
		)
		.optional(),
});

const PluginConfigSchema = z.discriminatedUnion("name", [
	z.object({
		name: z.literal("DefaultEvictor"),
		args: z
			.object({
				nodeSelector: z.string().optional(),
				labelSelector: LabelSelectorSchema.optional(),
				namespaceLabelSelector: LabelSelectorSchema.optional(),
				nodeFit: z.boolean().optional(),
				minReplicas: z.number().min(1).optional(),
				minPodAge: z.string().optional(),
				priorityThreshold: z
					.object({
						value: z.number().optional(),
						name: z.string().optional(),
					})
					.optional(),
				noEvictionPolicy: z.enum(["Preferred", "Mandatory"]).optional(),
				podProtections: z
					.object({
						defaultDisabled: z.array(DefaultDisabledSchema).optional(),
						extraEnabled: z.array(ExtraEnabledSchema).optional(),
						config: z
							.object({
								PodsWithPVC: z
									.object({
										protectedStorageClasses: z
											.array(z.object({ name: z.string() }))
											.optional(),
									})
									.optional(),
							})
							.optional(),
					})
					.optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemoveDuplicates"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				excludeOwnerKinds: z.array(z.string()).optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemovePodsHavingTooManyRestarts"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				podRestartThreshold: z
					.number()
					.min(1, "invalid PodsHavingTooManyRestarts threshold")
					.optional(),
				includingInitContainers: z.boolean().optional(),
				states: z.array(z.string()).optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemovePodsViolatingNodeAffinity"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				nodeAffinityType: z
					.array(z.string())
					.min(1, "nodeAffinityType needs to be set")
					.optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemovePodsViolatingNodeTaints"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				includePreferNoSchedule: z.boolean().optional(),
				excludedTaints: z.array(z.string()).optional(),
				includedTaints: z.array(z.string()).optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemovePodsViolatingInterPodAntiAffinity"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemovePodsViolatingTopologySpreadConstraint"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				constraints: z
					.array(z.enum(["DoNotSchedule", "ScheduleAnyway"]))
					.optional(),
				topologyBalanceNodeFit: z.boolean().optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("LowNodeUtilization"),
		args: z
			.object({
				useDeviationThresholds: z.boolean().optional(),
				thresholds: ResourceThresholdsSchema.optional(),
				targetThresholds: ResourceThresholdsSchema.optional(),
				numberOfNodes: z.number().min(0).optional(),
				metricsUtilization: z
					.object({
						metricsServer: z.boolean().optional(),
						source: z.enum(["KubernetesMetrics", "Prometheus"]).optional(),
						prometheus: z.object({ query: z.string() }).optional(),
					})
					.optional(),
				evictableNamespaces: NamespacesSchema.optional(),
				evictionLimits: z
					.object({ node: z.number().min(0).optional() })
					.optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("HighNodeUtilization"),
		args: z
			.object({
				thresholds: ResourceThresholdsSchema.optional(),
				numberOfNodes: z.number().min(0).optional(),
				evictionModes: z
					.array(z.enum(["OnlyThresholdingResources"]))
					.optional(),
				evictableNamespaces: NamespacesSchema.optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("PodLifeTime"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				ownerKinds: z
					.object({
						include: z.array(z.string()).optional(),
						exclude: z.array(z.string()).optional(),
					})
					.optional(),
				maxPodLifeTimeSeconds: z.number().min(0).optional(),
				states: z.array(z.string()).optional(),
				conditions: z
					.array(
						z.object({
							type: z.string().optional(),
							status: z.string().optional(),
							reason: z.string().optional(),
							minTimeSinceLastTransitionSeconds: z.number().min(0).optional(),
						}),
					)
					.optional(),
				exitCodes: z.array(z.number()).optional(),
				includingInitContainers: z.boolean().optional(),
				includingEphemeralContainers: z.boolean().optional(),
			})
			.optional(),
	}),
	z.object({
		name: z.literal("RemoveFailedPods"),
		args: z
			.object({
				namespaces: NamespacesSchema.optional(),
				labelSelector: LabelSelectorSchema.optional(),
				excludeOwnerKinds: z.array(z.string()).optional(),
				minPodLifetimeSeconds: z.number().min(0).optional(),
				reasons: z.array(z.string()).optional(),
				exitCodes: z.array(z.number()).optional(),
				includingInitContainers: z.boolean().optional(),
			})
			.optional(),
	}),
]);

const PolicySchema = z.object({
	apiVersion: z
		.literal("descheduler/v1alpha2")
		.describe("API version of the descheduler policy"),
	kind: z
		.literal("DeschedulerPolicy")
		.describe("Kind of the descheduler policy resource"),
	nodeSelector: z
		.string()
		.describe(
			"Restrict descheduler to operate only on nodes matching this selector",
		)
		.optional(),
	maxNoOfPodsToEvictPerNode: z
		.number()
		.min(0)
		.describe("Maximum number of pods to evict per node per descheduling cycle")
		.default(10),
	maxNoOfPodsToEvictPerNamespace: z
		.number()
		.min(0)
		.describe(
			"Maximum number of pods to evict per namespace per descheduling cycle",
		)
		.optional(),
	maxNoOfPodsToEvictTotal: z
		.number()
		.min(0)
		.describe("Maximum total number of pods to evict per descheduling cycle")
		.optional(),
	evictionFailureEventNotification: z
		.boolean()
		.describe("Emit Kubernetes events when pod evictions fail")
		.default(false),
	gracePeriodSeconds: z
		.number()
		.min(0)
		.describe(
			"Grace period in seconds before evicted pods are forcibly deleted. Zero means delete immediately",
		)
		.optional(),
	profiles: z
		.array(
			z.object({
				name: z
					.string()
					.min(1, "profile name cannot be empty")
					.describe("Name of the descheduler profile"),
				pluginConfig: z
					.array(PluginConfigSchema)
					.describe("Plugin configurations for this profile"),
				plugins: z
					.object({
						preSort: PluginSetSchema.optional(),
						sort: PluginSetSchema.optional(),
						deschedule: PluginSetSchema.optional(),
						balance: PluginSetSchema.optional(),
						filter: PluginSetSchema.optional(),
						preEvictionFilter: PluginSetSchema.optional(),
					})
					.describe(
						"Plugin sets for each extension point in the scheduling pipeline",
					),
			}),
		)
		.describe("List of descheduler profiles with plugin configurations"),
});

const DefaultPolicy: z.infer<typeof PolicySchema> = {
	apiVersion: "descheduler/v1alpha2",
	kind: "DeschedulerPolicy",
	maxNoOfPodsToEvictPerNode: 10,
	evictionFailureEventNotification: false,
	profiles: [
		{
			name: "default",
			pluginConfig: [
				{
					name: "DefaultEvictor",
					args: {
						podProtections: {
							defaultDisabled: ["PodsWithLocalStorage"],
							extraEnabled: ["PodsWithPVC"],
						},
					},
				},
				{ name: "RemoveDuplicates" },
				{
					name: "RemovePodsHavingTooManyRestarts",
					args: {
						includingInitContainers: true,
						podRestartThreshold: 100,
					},
				},
				{
					name: "RemovePodsViolatingNodeAffinity",
					args: {
						nodeAffinityType: [
							"requiredDuringSchedulingIgnoredDuringExecution",
						],
					},
				},
				{ name: "RemovePodsViolatingNodeTaints" },
				{ name: "RemovePodsViolatingInterPodAntiAffinity" },
				{ name: "RemovePodsViolatingTopologySpreadConstraint" },
				{
					name: "LowNodeUtilization",
					args: {
						targetThresholds: { cpu: 50, memory: 50, pods: 50 },
						thresholds: { cpu: 20, memory: 20, pods: 20 },
					},
				},
			],
			plugins: {
				balance: {
					enabled: [
						"RemoveDuplicates",
						"RemovePodsViolatingTopologySpreadConstraint",
						"LowNodeUtilization",
					],
				},
				deschedule: {
					enabled: [
						"RemovePodsHavingTooManyRestarts",
						"RemovePodsViolatingNodeTaints",
						"RemovePodsViolatingNodeAffinity",
						"RemovePodsViolatingInterPodAntiAffinity",
					],
				},
			},
		},
	],
};

const IstioAuthSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	authorizationPolicy: z
		.object({
			enabled: z.boolean().default(true),
			action: z.enum(["ALLOW", "DENY", "AUDIT"]).default("ALLOW"),
			allowedPrincipals: z
				.array(z.string())
				.describe(
					"Istio principals allowed to access the descheduler metrics endpoint (e.g. cluster.local/ns/observability/sa/alloy)",
				)
				.default([]),
		})
		.prefault({}),
});

const SecretProviderClassSchema = OpenBaoSpcSchema.extend({
	vaultRole: z
		.string()
		.describe("OpenBao Kubernetes auth role for the descheduler SA")
		.default("descheduler"),
	pkiPath: z
		.string()
		.describe("OpenBao PKI issue endpoint path, e.g. pki/issue/descheduler")
		.default("pki/issue/descheduler"),
});

/** Zod schema for validating descheduler chart configuration. All fields have defaults, so an empty object produces a valid config. */
const deschedulerConfig = defineConfig({
	chartName: "DeschedulerChart",
	base: ["revisionHistoryLimit"],
	shared: [
		"resourceTier",
		"livenessProbe",
		"readinessProbe",
		"disableMetrics",
		"ciliumPolicy",
		"istioMesh",
		"vpa",
		"hpa",
	],
	fields: {
		name: z
			.string()
			.describe("Name of the descheduler deployment and associated resources")
			.default("descheduler"),
		namespace: z
			.string()
			.describe("Kubernetes namespace where the descheduler will be deployed")
			.default("kube-system"),
		version: z
			.string()
			.describe("Descheduler container image version")
			.default(KnownLatestDeschedulerVersion),
		image: z
			.string()
			.describe(
				"Container image override. Defaults to registry.k8s.io/descheduler/descheduler:v<version>",
			)
			.optional(),
		runAsUser: z
			.number()
			.describe("UID to run the descheduler container as")
			.default(1001),
		runAsGroup: z
			.number()
			.describe("GID to run the descheduler container as")
			.default(1001),
		fsGroup: z
			.number()
			.describe("FS group for mounted volumes in the descheduler container")
			.default(1001),
		replicas: z
			.number()
			.min(1, "replicas must be at least 1")
			.describe("Number of descheduler pod replicas")
			.default(2),
		deschedulingInterval: DurationSchema.describe(
			"Time interval between consecutive descheduler executions",
		).default("2m"),
		logVerbosity: z
			.string()
			.regex(/^\d+$/, "log verbosity must be a numeric string")
			.describe(
				"Log verbosity level (higher = more verbose, maps to klog -v flag)",
			)
			.default("3"),
		leaderElection: z
			.object({
				enabled: z
					.boolean()
					.describe(
						"Enable leader election to run a single active descheduler instance across replicas",
					)
					.default(true),
				leaseDuration: DurationSchema.describe(
					"Duration that non-leader candidates will wait before forcing leader acquisition",
				).default("15s"),
				renewDeadline: DurationSchema.describe(
					"Duration the acting leader will retry refreshing leadership before giving up",
				).default("10s"),
				retryPeriod: DurationSchema.describe(
					"Duration the leader should wait between renewing leadership",
				).default("2s"),
				resourceLock: z
					.string()
					.describe(
						"Type of resource object used for locking during leader election",
					)
					.default("leases"),
				resourceName: z
					.string()
					.describe(
						"Name of the resource object used for leader election locking",
					)
					.default("descheduler"),
				resourceNamespace: z
					.string()
					.describe(
						"Namespace of the resource object used for leader election locking",
					)
					.default("kube-system"),
			})
			.describe(
				"Leader election configuration for running multiple replicas safely",
			)
			.prefault({}),
		priorityClassName: z
			.string()
			.describe("Priority class name for the descheduler pods")
			.default("system-cluster-critical"),
		metricsPort: z
			.number()
			.min(1, "port must be in [1, 65535]")
			.max(65535, "port must be in [1, 65535]")
			.describe("Port for the metrics and healthz HTTPS endpoint")
			.default(10258),
		policy: PolicySchema.describe(
			"Descheduler policy configuration including profiles, plugins, and eviction limits",
		).default(() => DefaultPolicy),
		dryRun: z
			.boolean()
			.describe(
				"Run descheduler in dry-run mode — evaluate policies without actually evicting pods",
			)
			.default(false),
		enableHTTP2: z
			.boolean()
			.describe("Enable HTTP/2 for the metrics and healthz endpoints")
			.default(true),
		tracing: z
			.object({
				collectorEndpoint: z
					.string()
					.describe("OpenTelemetry collector gRPC endpoint for trace export")
					.default(
						"http://otel-collector.observability.svc.cluster.local:4317",
					),
				transportCert: z
					.string()
					.describe(
						"Path to CA certificate for TLS-secured OTEL collector connection. If unset, uses insecure mode",
					)
					.optional(),
				sampleRate: z
					.number()
					.min(0)
					.max(1)
					.describe(
						"Trace sampling ratio (0.0 = none, 1.0 = all). Lower values reduce overhead",
					)
					.default(0.1),
				fallbackToNoOpProviderOnError: z
					.boolean()
					.describe(
						"Fall back to a no-op tracer if the OTEL collector is unreachable, preventing descheduler crashes",
					)
					.default(true),
			})
			.describe(
				"OpenTelemetry tracing configuration for distributed trace export",
			)
			.prefault({}),
		featureGates: z
			.object({
				EvictionsInBackground: z
					.boolean()
					.describe(
						"Enable background evictions so users can create custom eviction policies as an alternative to immediate evictions (alpha, v1.31+)",
					)
					.default(false),
			})
			.describe("Descheduler feature gates for alpha/experimental features")
			.prefault({}),
		clientConnection: z
			.object({
				qps: z
					.number()
					.min(0)
					.describe("QPS limit for Kubernetes API server requests")
					.optional(),
				burst: z
					.number()
					.min(0)
					.describe("Burst limit for Kubernetes API server requests")
					.optional(),
			})
			.describe("Kubernetes API server client connection tuning")
			.prefault({}),
		secretProviderClass: SecretProviderClassSchema.prefault({}).describe(
			"OpenBao CSI SecretProviderClass configuration for fetching TLS certificates from OpenBao PKI for the descheduler HTTPS metrics endpoint",
		),
		istioAuth: IstioAuthSchema.prefault({}).describe(
			"Istio AuthorizationPolicy restricting metrics endpoint access to specified principals (e.g. Alloy scraper)",
		),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image:
			parsed.image ??
			`registry.k8s.io/descheduler/descheduler:v${parsed.version}`,
	}),
});

export const DeschedulerConfigSchema = deschedulerConfig.schema;
export const DeschedulerConfigError = deschedulerConfig.ConfigError;
export const DeschedulerPolicyConfigMap = defineConfigMap(
	{
		component: "descheduler",
		name: (c) => c.name,
		dataSchema: z.object({
			"policy.yaml": z.string(),
		}),
		map: (c) => ({
			"policy.yaml": stringify(c.policy),
		}),
	},
	DeschedulerConfigError,
);
export { deschedulerConfig };

export type Config = InferConfig<typeof deschedulerConfig>;
