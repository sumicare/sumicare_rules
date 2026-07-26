/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import {
	PrometheusServiceMonitor as ServiceMonitor,
	PrometheusServiceMonitorEndpointScheme as ServiceMonitorEndpointScheme,
	PrometheusServiceMonitorMetricRelabelingsAction as ServiceMonitorMetricRelabelingsAction,
	PrometheusServiceMonitorRelabelingsAction as ServiceMonitorRelabelingsAction,
} from "@sumicare/stack-observability-crds";
import { Construct } from "constructs";

const METRIC_PATTERN = "kamaji_(build_info|controller_*|datastore_*|tenant_*)";

/**
 * Creates a Prometheus ServiceMonitor for the Kamaji controller metrics
 * endpoint, enabling Prometheus Operator to scrape metrics from port 8080.
 */
export class KamajiServiceMonitor extends Construct {
	readonly serviceMonitor: ServiceMonitor;

	constructor(scope: Construct, config: Config) {
		super(scope, "servicemonitor");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "controller",
			...config.serviceMonitor.labels,
		};

		this.serviceMonitor = new ServiceMonitor(
			this,
			"controller-servicemonitor",
			{
				metadata: {
					name: `${config.name}-controller`,
					namespace: config.namespace,
					labels,
				},
				spec: {
					jobLabel: "jobLabel",
					namespaceSelector: {
						matchNames: [config.namespace],
					},
					selector: {
						matchLabels: componentLabels(config.name, "controller"),
					},
					endpoints: [
						{
							honorLabels: true,
							port: "metrics",
							interval: config.serviceMonitor.interval,
							scheme: ServiceMonitorEndpointScheme.HTTP,
							metricRelabelings: [
								{
									action: ServiceMonitorMetricRelabelingsAction.KEEP,
									regex: METRIC_PATTERN,
									sourceLabels: ["__name__"],
								},
							],
							relabelings: [
								{
									sourceLabels: ["__meta_kubernetes_pod_node_name"],
									separator: ";",
									regex: "^(.*)$",
									targetLabel: "nodename",
									replacement: "$1",
									action: ServiceMonitorRelabelingsAction.REPLACE,
								},
								{
									targetLabel: "otel_service_name",
									replacement: config.name,
									action: ServiceMonitorRelabelingsAction.REPLACE,
								},
								{
									targetLabel: "otel_service_namespace",
									replacement: config.namespace,
									action: ServiceMonitorRelabelingsAction.REPLACE,
								},
							],
						},
					],
				},
			},
		);
	}
}
