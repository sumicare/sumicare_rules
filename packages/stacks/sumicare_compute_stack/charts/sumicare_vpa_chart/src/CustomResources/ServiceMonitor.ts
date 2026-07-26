/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";
import type { VpaService } from "Compute/Vpa/Resources/Service";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import {
	PrometheusServiceMonitor as ServiceMonitor,
	PrometheusServiceMonitorEndpointScheme as ServiceMonitorEndpointScheme,
	PrometheusServiceMonitorMetricRelabelingsAction as ServiceMonitorMetricRelabelingsAction,
	PrometheusServiceMonitorRelabelingsAction as ServiceMonitorRelabelingsAction,
} from "@sumicare/stack-observability-crds";
import { Construct } from "constructs";

type Component = "recommender" | "updater" | "admission-controller";

const METRIC_PATTERNS: Record<Component, string> = {
	recommender:
		"vpa_recommender_(build_info|recommendation|requests_target|aborted)",
	updater: "vpa_updater_(build_info|evictions|updates)",
	"admission-controller":
		"vpa_admission_controller_(build_info|admission_requests|admission_errors)",
};

/**
 * Creates ServiceMonitor custom resources for the VPA recommender, updater,
 * and admission controller components, enabling Prometheus Operator
 * to scrape metrics from each component's /metrics endpoint via
 * their dedicated metrics Services.
 *
 * Each ServiceMonitor includes metric relabeling to keep only key VPA
 * metrics and relabeling to attach node name and OTEL service attributes.
 *
 * ServiceMonitors are used (rather than PodMonitors) because each component
 * has a Service exposing the metrics port:
 * - Admission controller: webhook Service with a metrics port (8944)
 * - Recommender: dedicated metrics Service on port 8942
 * - Updater: dedicated metrics Service on port 8943
 */
export class VpaServiceMonitor extends Construct {
	/** The recommender ServiceMonitor, or undefined if disabled. */
	readonly recommenderServiceMonitor: ServiceMonitor | undefined;
	/** The updater ServiceMonitor, or undefined if disabled. */
	readonly updaterServiceMonitor: ServiceMonitor | undefined;
	/** The admission controller ServiceMonitor, or undefined if disabled. */
	readonly admissionControllerServiceMonitor: ServiceMonitor | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed VPA config.
	 * @param vpaService - The VpaService instance containing the metrics Services.
	 */
	constructor(scope: Construct, config: Config, vpaService: VpaService) {
		super(scope, "servicemonitors");

		const serviceName = config.name;
		const serviceNamespace = config.namespace;

		if (config.recommender.enabled && vpaService.recommenderMetricsService) {
			this.recommenderServiceMonitor = this.createServiceMonitor(
				config,
				"recommender",
				serviceName,
				serviceNamespace,
			);
		}

		if (config.updater.enabled && vpaService.updaterMetricsService) {
			this.updaterServiceMonitor = this.createServiceMonitor(
				config,
				"updater",
				serviceName,
				serviceNamespace,
			);
		}

		if (config.admissionController.enabled && vpaService.service) {
			this.admissionControllerServiceMonitor = this.createServiceMonitor(
				config,
				"admission-controller",
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
