/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	commonLabels,
	componentLabels,
	selectorLabels,
} from "Commons/Workloads/Labels";
import { ApiObject } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

// ── Schemas ───────────────────────────────────────────────────────────

/** Zod schema for Prometheus ServiceMonitor configuration. */
export const ServiceMonitorConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	port: z.string().describe("Named port to scrape").default("http"),
	interval: z.string().describe("Scrape interval (Go duration)").default("30s"),
	scheme: z.enum(["HTTP", "HTTPS"]).default("HTTP"),
	metricRegex: z
		.string()
		.describe("Regex for metricRelabelings KEEP action")
		.default(".*"),
	tlsConfig: z
		.object({
			ca: z
				.object({
					secret: z.object({
						name: z.string(),
						key: z.string().default("ca.crt"),
					}),
				})
				.optional(),
			serverName: z.string().optional(),
			insecureSkipVerify: z.boolean().default(false),
		})
		.optional(),
});

/** Zod schema for Prometheus PodMonitor configuration. */
export const PodMonitorConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	port: z.string().describe("Named port to scrape").default("http"),
	interval: z.string().describe("Scrape interval (Go duration)").default("30s"),
	scheme: z.enum(["HTTP", "HTTPS"]).default("HTTP"),
	path: z.string().describe("Metrics path").default("/metrics"),
	metricRegex: z
		.string()
		.describe("Regex for metricRelabelings KEEP action")
		.default(".*"),
});

/** Zod schema for PrometheusRule configuration. */
export const PrometheusRuleConfigSchema = z.object({
	enabled: z.boolean().default(false),
	annotations: z.record(z.string(), z.string()).default({}),
	labels: z.record(z.string(), z.string()).default({}),
	groups: z
		.array(
			z.object({
				name: z.string(),
				rules: z
					.array(
						z.object({
							name: z.string().optional(),
							expr: z.string(),
							for: z.string().optional(),
							labels: z.record(z.string(), z.string()).optional(),
							annotations: z.record(z.string(), z.string()).optional(),
							record: z.string().optional(),
						}),
					)
					.default([]),
			}),
		)
		.default([]),
});

// ── ServiceMonitor ────────────────────────────────────────────────────

/** Options for {@link defineServiceMonitor}. */
export interface DefineServiceMonitorOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	port: string;
	interval?: string;
	scheme?: "HTTP" | "HTTPS";
	metricRegex?: string;
	tlsConfig?: {
		ca?: { secret: { name: string; key: string } };
		serverName?: string;
		insecureSkipVerify?: boolean;
	};
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/** Standard OTEL + node-name relabelings applied to all ServiceMonitor endpoints. */
const standardRelabelings = (name: string, namespace: string) => [
	{
		sourceLabels: ["__meta_kubernetes_pod_node_name"],
		separator: ";",
		regex: "^(.*)$",
		targetLabel: "nodename",
		replacement: "$1",
		action: "replace",
	},
	{
		targetLabel: "otel_service_name",
		replacement: name,
		action: "replace",
	},
	{
		targetLabel: "otel_service_namespace",
		replacement: namespace,
		action: "replace",
	},
];

/**
 * Creates a Prometheus ServiceMonitor custom resource for scraping
 * metrics from the specified service port. Includes standard OTEL
 * relabelings and metric filtering via the provided regex.
 */
export const defineServiceMonitor = (
	opts: DefineServiceMonitorOpts,
): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}`
		: `${opts.name}-servicemonitor`;

	const selectorMatch = opts.component
		? componentLabels(opts.name, opts.component)
		: selectorLabels(opts.name);

	const endpoint: Record<string, unknown> = {
		honorLabels: true,
		port: opts.port,
		interval: opts.interval ?? "30s",
		scheme: (opts.scheme ?? "HTTP").toLowerCase(),
		metricRelabelings: [
			{
				action: "keep",
				regex: opts.metricRegex ?? ".*",
				sourceLabels: ["__name__"],
			},
		],
		relabelings: standardRelabelings(opts.name, opts.namespace),
	};

	if (opts.tlsConfig) {
		endpoint.tlsConfig = opts.tlsConfig;
	}

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "monitoring.coreos.com/v1",
		kind: "ServiceMonitor",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			jobLabel: "jobLabel",
			targetLabels: [
				`otel.service.name/${opts.name}`,
				`otel.service.namespace/${opts.namespace}`,
			],
			namespaceSelector: {
				matchNames: [opts.namespace],
			},
			selector: {
				matchLabels: selectorMatch,
			},
			endpoints: [endpoint],
		},
	});
};

/** Options for {@link definePodMonitor}. */
export interface DefinePodMonitorOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	port: string;
	interval?: string;
	scheme?: "HTTP" | "HTTPS";
	path?: string;
	metricRegex?: string;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/**
 * Creates a Prometheus PodMonitor custom resource for pod-level
 * metrics scraping (without requiring a Service).
 */
export const definePodMonitor = (opts: DefinePodMonitorOpts): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}`
		: `${opts.name}-podmonitor`;

	const selectorMatch = opts.component
		? componentLabels(opts.name, opts.component)
		: selectorLabels(opts.name);

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "monitoring.coreos.com/v1",
		kind: "PodMonitor",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			podTargetLabels: [
				`otel.service.name/${opts.name}`,
				`otel.service.namespace/${opts.namespace}`,
			],
			selector: {
				matchLabels: selectorMatch,
			},
			podMetricsEndpoints: [
				{
					port: opts.port,
					interval: opts.interval ?? "30s",
					scheme: (opts.scheme ?? "HTTP").toLowerCase(),
					path: opts.path ?? "/metrics",
					metricRelabelings: [
						{
							action: "keep",
							regex: opts.metricRegex ?? ".*",
							sourceLabels: ["__name__"],
						},
					],
					relabelings: standardRelabelings(opts.name, opts.namespace),
				},
			],
		},
	});
};

/** Options for {@link definePrometheusRule}. */
export interface DefinePrometheusRuleOpts {
	scope: Construct;
	id: string;
	name: string;
	namespace: string;
	version: string;
	component?: string;
	groups: Array<{
		name: string;
		rules: Array<{
			name?: string;
			expr: string;
			for?: string;
			labels?: Record<string, string>;
			annotations?: Record<string, string>;
			record?: string;
		}>;
	}>;
	labels?: Record<string, string>;
	annotations?: Record<string, string>;
}

/**
 * Creates a PrometheusRule custom resource for recording and
 * alerting rules.
 */
export const definePrometheusRule = (
	opts: DefinePrometheusRuleOpts,
): ApiObject => {
	const labels = {
		...commonLabels({ name: opts.name, version: opts.version }),
		...(opts.component
			? { "app.kubernetes.io/component": opts.component }
			: {}),
		...opts.labels,
	};

	const resourceName = opts.component
		? `${opts.name}-${opts.component}-rules`
		: `${opts.name}-rules`;

	return new ApiObject(opts.scope, opts.id, {
		apiVersion: "monitoring.coreos.com/v1",
		kind: "PrometheusRule",
		metadata: {
			name: resourceName,
			namespace: opts.namespace,
			labels,
			annotations: opts.annotations,
		},
		spec: {
			groups: opts.groups,
		},
	});
};
