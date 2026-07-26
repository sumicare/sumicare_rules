/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import type { KedaService } from "Compute/Keda/Resources/Service";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import {
	PrometheusServiceMonitor as ServiceMonitor,
	PrometheusServiceMonitorEndpointScheme as ServiceMonitorEndpointScheme,
	PrometheusServiceMonitorMetricRelabelingsAction as ServiceMonitorMetricRelabelingsAction,
	PrometheusServiceMonitorRelabelingsAction as ServiceMonitorRelabelingsAction,
} from "@sumicare/stack-observability-crds";
import { Construct } from "constructs";

type Component = "operator" | "metrics-server" | "webhooks";

const METRIC_PATTERNS: Record<Component, string> = {
	operator: "keda_(build_info|operator|scaled_object|trigger|scaler|metric)",
	"metrics-server":
		"keda_(build_info|metrics_adapter|external_metrics|api_service)",
	webhooks: "keda_(build_info|admission_webhooks|webhook)",
};

/**
 * Creates ServiceMonitor custom resources for the KEDA operator, metrics
 * server, and admission webhooks components, enabling Prometheus Operator
 * to scrape metrics from each component's /metrics endpoint via
 * their dedicated Services.
 *
 * Each ServiceMonitor includes metric relabeling to keep only key KEDA
 * metrics and relabeling to attach node name and OTEL service attributes.
 */
export class KedaServiceMonitor extends Construct {
	/** The operator ServiceMonitor. */
	readonly operatorServiceMonitor: ServiceMonitor;
	/** The metrics server ServiceMonitor, or undefined if disabled. */
	readonly metricsServerServiceMonitor: ServiceMonitor | undefined;
	/** The admission webhooks ServiceMonitor, or undefined if disabled. */
	readonly webhooksServiceMonitor: ServiceMonitor | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed KEDA config.
	 * @param kedaService - The KedaService instance containing the Services.
	 */
	constructor(scope: Construct, config: Config, kedaService: KedaService) {
		super(scope, "servicemonitors");

		const serviceName = config.name;
		const serviceNamespace = config.namespace;

		this.operatorServiceMonitor = this.createServiceMonitor(
			config,
			"operator",
			serviceName,
			serviceNamespace,
		);

		if (config.metricsServer.enabled && kedaService.metricsServerService) {
			this.metricsServerServiceMonitor = this.createServiceMonitor(
				config,
				"metrics-server",
				serviceName,
				serviceNamespace,
			);
		}

		if (config.webhooks.enabled && kedaService.webhooksService) {
			this.webhooksServiceMonitor = this.createServiceMonitor(
				config,
				"webhooks",
				serviceName,
				serviceNamespace,
			);
		}
	}

	private createServiceMonitor(
		config: Config,
		component: Component,
		serviceName: string,
		serviceNamespace: string,
	): ServiceMonitor {
		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": component,
		};

		return new ServiceMonitor(this, `${component}-servicemonitor`, {
			metadata: {
				name: `${config.name}-${component}`,
				namespace: config.namespace,
				labels,
			},
			spec: {
				jobLabel: "jobLabel",
				targetLabels: [
					`otel.service.name/${serviceName}`,
					`otel.service.namespace/${serviceNamespace}`,
				],
				namespaceSelector: {
					matchNames: [config.namespace],
				},
				selector: {
					matchLabels: componentLabels(config.name, component),
				},
				endpoints: [
					{
						honorLabels: true,
						port: "metrics",
						interval: "30s",
						scheme: ServiceMonitorEndpointScheme.HTTP,
						metricRelabelings: [
							{
								action: ServiceMonitorMetricRelabelingsAction.KEEP,
								regex: METRIC_PATTERNS[component],
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
								replacement: serviceName,
								action: ServiceMonitorRelabelingsAction.REPLACE,
							},
							{
								targetLabel: "otel_service_namespace",
								replacement: serviceNamespace,
								action: ServiceMonitorRelabelingsAction.REPLACE,
							},
						],
					},
				],
			},
		});
	}
}
