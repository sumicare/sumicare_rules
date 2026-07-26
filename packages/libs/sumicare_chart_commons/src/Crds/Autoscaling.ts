/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { commonLabels } from "Commons/Workloads/Labels";
import { ApiObject } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

// ── Schemas ───────────────────────────────────────────────────────────

/** Zod schema for VerticalPodAutoscaler configuration. */
export const VpaConfigSchema = z.object({
	enabled: z.boolean().default(false),
	updateMode: z
		.enum(["Off", "Initial", "Recreate", "Auto"])
		.describe(
			"VPA update mode: Off=recommendations only, Initial=in-place on pod creation, Recreate=evict+recreate, Auto=in-place",
		)
		.default("Off"),
	controlledResources: z
		.array(z.enum(["cpu", "memory"]))
		.describe("Resources VPA should control")
		.default(["cpu", "memory"]),
	controlledValues: z
		.enum(["RequestsAndLimits", "RequestsOnly"])
		.default("RequestsAndLimits"),
	containerPolicies: z
		.array(
			z.object({
				containerName: z.string(),
				minAllowed: z
					.object({
						cpu: z.string().optional(),
						memory: z.string().optional(),
					})
					.optional(),
				maxAllowed: z
					.object({
						cpu: z.string().optional(),
						memory: z.string().optional(),
					})
					.optional(),
			}),
		)
		.default([]),
});

/** Zod schema for HorizontalPodAutoscaler configuration. */
export const HpaConfigSchema = z.object({
	enabled: z.boolean().default(false),
	minReplicas: z.number().int().min(1).default(2),
	maxReplicas: z.number().int().min(1).default(10),
	metrics: z
		.array(
			z.discriminatedUnion("type", [
				z.object({
					type: z.literal("Resource"),
					resource: z.object({
						name: z.enum(["cpu", "memory"]),
						target: z.object({
							type: z.enum(["Utilization", "AverageValue", "Value"]),
							averageUtilization: z.number().int().min(1).max(100).optional(),
							averageValue: z.string().optional(),
							value: z.string().optional(),
						}),
					}),
				}),
				z.object({
					type: z.literal("Pods"),
					pods: z.object({
						metric: z.object({
							name: z.string(),
							selector: z
								.object({ matchLabels: z.record(z.string(), z.string()) })
								.optional(),
						}),
						target: z.object({
							type: z.enum(["AverageValue", "Value"]),
							averageValue: z.string().optional(),
							value: z.string().optional(),
						}),
					}),
				}),
				z.object({
					type: z.literal("External"),
					external: z.object({
						metric: z.object({
							name: z.string(),
							selector: z
								.object({ matchLabels: z.record(z.string(), z.string()) })
								.optional(),
						}),
						target: z.object({
							type: z.enum(["AverageValue", "Value", "Utilization"]),
							averageValue: z.string().optional(),
							value: z.string().optional(),
							averageUtilization: z.number().int().min(1).max(100).optional(),
						}),
					}),
				}),
			]),
		)
		.default([
			{
				type: "Resource",
				resource: {
					name: "cpu",
					target: { type: "Utilization", averageUtilization: 80 },
				},
			},
		]),
	behavior: z
		.object({
			scaleUp: z
				.object({
					stabilizationWindowSeconds: z.number().int().min(0).optional(),
					policies: z
						.array(
							z.object({
								type: z.enum(["Percent", "Pods"]),
								value: z.number().int().min(1),
								periodSeconds: z.number().int().min(1),
							}),
						)
						.optional(),
				})
				.optional(),
			scaleDown: z
				.object({
					stabilizationWindowSeconds: z.number().int().min(0).optional(),
					policies: z
						.array(
							z.object({
								type: z.enum(["Percent", "Pods"]),
								value: z.number().int().min(1),
								periodSeconds: z.number().int().min(1),
							}),
						)
						.optional(),
				})
				.optional(),
		})
		.optional(),
});

/** Zod schema for KEDA Kafka trigger. */
export const KafkaTriggerSchema = z.object({
	type: z.literal("kafka"),
	bootstrapServers: z
		.string()
		.describe("Kafka bootstrap servers (comma-separated)"),
	topic: z.string(),
	consumerGroup: z.string(),
	lagThreshold: z.number().int().min(1).default(10),
	offsetResetPolicy: z.enum(["latest", "earliest"]).default("latest"),
});

/** Zod schema for KEDA NATS JetStream trigger. */
export const NatsJetStreamTriggerSchema = z.object({
	type: z.literal("nats-jetstream"),
	server: z.string().describe("NATS server URL"),
	stream: z.string(),
	consumer: z.string(),
	lagThreshold: z.number().int().min(1).default(10),
});

/** Zod schema for KEDA Prometheus trigger. */
export const PrometheusTriggerSchema = z.object({
	type: z.literal("prometheus"),
	serverAddress: z.string().describe("Prometheus server URL"),
	query: z.string().describe("PromQL query for the metric"),
	threshold: z.number().describe("Threshold to trigger scaling"),
	activationThreshold: z
		.number()
		.describe("Activation threshold (below this, scale to min)")
		.optional(),
});

/** Discriminated union of all KEDA trigger types. */
export const TriggerSchema = z.discriminatedUnion("type", [
	KafkaTriggerSchema,
	NatsJetStreamTriggerSchema,
	PrometheusTriggerSchema,
]);

/** Zod schema for KEDA ScaledObject configuration. */
export const ScaledObjectConfigSchema = z.object({
	enabled: z.boolean().default(false),
	minReplicaCount: z.number().int().min(0).default(1),
	maxReplicaCount: z.number().int().min(1).default(10),
	pollingInterval: z.number().int().min(1).default(30),
	cooldownPeriod: z.number().int().min(0).default(300),
	triggers: z.array(TriggerSchema).default([]),
});

/** Zod schema for KEDA TriggerAuthentication configuration. */
export const TriggerAuthenticationConfigSchema = z.object({
	enabled: z.boolean().default(false),
	secretTargetRef: z
		.array(
			z.object({
				parameter: z.string(),
				name: z.string().describe("Secret name"),
				key: z.string().describe("Secret key"),
			}),
		)
		.default([]),
});

// ── VPA ───────────────────────────────────────────────────────────────

/** Options for {@link defineVpa}. */
export interface DefineVpaOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	targetRef: {
		apiVersion: string;
		kind: string;
		name: string;
	};
	updateMode?: "Off" | "Initial" | "Recreate" | "Auto";
	controlledResources?: ("cpu" | "memory")[];
	controlledValues?: "RequestsAndLimits" | "RequestsOnly";
	containerPolicies?: Array<{
		containerName: string;
		minAllowed?: { cpu?: string; memory?: string };
		maxAllowed?: { cpu?: string; memory?: string };
	}>;
	labels?: Record<string, string>;
}

/** Creates a VerticalPodAutoscaler custom resource. */
export const defineVpa = (opts: DefineVpaOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}-vpa`
		: `${opts.name}-vpa`;

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "autoscaling.k8s.io/v1",
		kind: "VerticalPodAutoscaler",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
		},
		spec: {
			targetRef: opts.targetRef,
			updatePolicy: {
				updateMode: opts.updateMode ?? "Off",
			},
			resourcePolicy: {
				containerPolicies: (opts.containerPolicies ?? []).map((p) => ({
					containerName: p.containerName,
					minAllowed: p.minAllowed,
					maxAllowed: p.maxAllowed,
					controlledResources: opts.controlledResources
						?.map((r) => r.charAt(0).toUpperCase() + r.slice(1))
						.join(","),
					controlledValues: opts.controlledValues,
				})),
			},
		},
	});
};

// ── HPA ───────────────────────────────────────────────────────────────

/** Options for {@link defineHpa}. */
export interface DefineHpaOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	scaleTargetRef: {
		apiVersion: string;
		kind: string;
		name: string;
	};
	minReplicas?: number;
	maxReplicas?: number;
	metrics?: Array<Record<string, unknown>>;
	behavior?: Record<string, unknown>;
	labels?: Record<string, string>;
}

/** Creates a HorizontalPodAutoscaler resource. */
export const defineHpa = (opts: DefineHpaOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}-hpa`
		: `${opts.name}-hpa`;

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "autoscaling/v2",
		kind: "HorizontalPodAutoscaler",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
		},
		spec: {
			scaleTargetRef: opts.scaleTargetRef,
			minReplicas: opts.minReplicas ?? 2,
			maxReplicas: opts.maxReplicas ?? 10,
			metrics: opts.metrics ?? [
				{
					type: "Resource",
					resource: {
						name: "cpu",
						target: { type: "Utilization", averageUtilization: 80 },
					},
				},
			],
			...(opts.behavior ? { behavior: opts.behavior } : {}),
		},
	});
};

// ── KEDA ScaledObject ──────────────────────────────────────────────────

/** Trigger configuration for KEDA ScaledObject. */
export type ScaledObjectTrigger =
	| {
			type: "kafka";
			bootstrapServers: string;
			topic: string;
			consumerGroup: string;
			lagThreshold?: number;
			offsetResetPolicy?: "latest" | "earliest";
	  }
	| {
			type: "nats-jetstream";
			server: string;
			stream: string;
			consumer: string;
			lagThreshold?: number;
	  }
	| {
			type: "prometheus";
			serverAddress: string;
			query: string;
			threshold: number;
			activationThreshold?: number;
	  };

/** Options for {@link defineScaledObject}. */
export interface DefineScaledObjectOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	scaleTargetRef: {
		apiVersion: string;
		kind: string;
		name: string;
	};
	minReplicaCount?: number;
	maxReplicaCount?: number;
	pollingInterval?: number;
	cooldownPeriod?: number;
	triggers: ScaledObjectTrigger[];
	labels?: Record<string, string>;
}

/** Maps a trigger config to KEDA trigger metadata. */
const mapTrigger = (trigger: ScaledObjectTrigger) => {
	if (trigger.type === "kafka") {
		return {
			type: "kafka",
			metadata: {
				bootstrapServers: trigger.bootstrapServers,
				topic: trigger.topic,
				consumerGroup: trigger.consumerGroup,
				lagThreshold: String(trigger.lagThreshold ?? 10),
				offsetResetPolicy: trigger.offsetResetPolicy ?? "latest",
			},
		};
	}
	if (trigger.type === "nats-jetstream") {
		return {
			type: "nats-jetstream",
			metadata: {
				natsServerMonitoring: trigger.server,
				stream: trigger.stream,
				consumer: trigger.consumer,
				lagThreshold: String(trigger.lagThreshold ?? 10),
			},
		};
	}
	return {
		type: "prometheus",
		metadata: {
			serverAddress: trigger.serverAddress,
			query: trigger.query,
			threshold: String(trigger.threshold),
			...(trigger.activationThreshold !== undefined
				? { activationThreshold: String(trigger.activationThreshold) }
				: {}),
		},
	};
};

/** Creates a KEDA ScaledObject custom resource for event-driven autoscaling. */
export const defineScaledObject = (opts: DefineScaledObjectOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}-scaledobject`
		: `${opts.name}-scaledobject`;

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "keda.sh/v1alpha1",
		kind: "ScaledObject",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
		},
		spec: {
			scaleTargetRef: {
				apiVersion: opts.scaleTargetRef.apiVersion,
				kind: opts.scaleTargetRef.kind,
				name: opts.scaleTargetRef.name,
			},
			minReplicaCount: opts.minReplicaCount ?? 1,
			maxReplicaCount: opts.maxReplicaCount ?? 10,
			pollingInterval: opts.pollingInterval ?? 30,
			cooldownPeriod: opts.cooldownPeriod ?? 300,
			triggers: opts.triggers.map(mapTrigger),
		},
	});
};

// ── KEDA TriggerAuthentication ─────────────────────────────────────────

/** Options for {@link defineTriggerAuthentication}. */
export interface DefineTriggerAuthOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	secretTargetRef: Array<{
		parameter: string;
		name: string;
		key: string;
	}>;
	labels?: Record<string, string>;
}

/** Creates a KEDA TriggerAuthentication for secret-backed trigger auth. */
export const defineTriggerAuthentication = (
	opts: DefineTriggerAuthOpts,
): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}-triggerauth`
		: `${opts.name}-triggerauth`;

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "keda.sh/v1alpha1",
		kind: "TriggerAuthentication",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
		},
		spec: {
			secretTargetRef: opts.secretTargetRef.map((ref) => ({
				parameter: ref.parameter,
				name: ref.name,
				key: ref.key,
			})),
		},
	});
};
