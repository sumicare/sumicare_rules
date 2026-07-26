/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates Services for VPA components:
 * - Admission controller webhook Service (port 443 -> http, plus metrics port)
 * - Recommender metrics Service (port 8942)
 * - Updater metrics Service (port 8943)
 *
 * All Services are configured for dual-stack IP families (IPv4 + IPv6).
 */
export class VpaService extends Construct {
	/** The CDK8s webhook Service resource, or undefined if admission controller is disabled. */
	readonly service: Service | undefined;
	/** The recommender metrics Service, or undefined if disabled. */
	readonly recommenderMetricsService: Service | undefined;
	/** The updater metrics Service, or undefined if disabled. */
	readonly updaterMetricsService: Service | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed VPA config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const labels = commonLabels(config);

		if (config.admissionController.enabled) {
			const admissionSelector = Pods.select(this, "admission-selector", {
				labels: componentLabels(config.name, "admission-controller"),
			});

			this.service = new Service(this, "webhook-service", {
				metadata: {
					name: `${config.name}-webhook`,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "admission-controller",
					},
				},
				type: ServiceType.CLUSTER_IP,
				ports: [
					{
						name: "https-webhook",
						port: 443,
						protocol: Protocol.TCP,
						targetPort: config.admissionController.httpPort,
					},
					{
						name: "metrics",
						port: config.admissionController.metricsPort,
						protocol: Protocol.TCP,
						targetPort: config.admissionController.metricsPort,
					},
				],
				selector: admissionSelector,
			});

			dualStack(ApiObject.of(this.service));
		}

		if (config.recommender.enabled) {
			this.recommenderMetricsService = this.createMetricsService(
				"recommender-metrics-service",
				`${config.name}-recommender-metrics`,
				config,
				"recommender",
				config.recommender.livenessProbe?.port ?? 8942,
			);
		}

		if (config.updater.enabled) {
			this.updaterMetricsService = this.createMetricsService(
				"updater-metrics-service",
				`${config.name}-updater-metrics`,
				config,
				"updater",
				config.updater.livenessProbe?.port ?? 8943,
			);
		}
	}

	private createMetricsService(
		id: string,
		name: string,
		config: Config,
		component: "recommender" | "updater",
		metricsPort: number,
	): Service {
		const selector = Pods.select(this, `${id}-selector`, {
			labels: componentLabels(config.name, component),
		});

		const svc = new Service(this, id, {
			metadata: {
				name,
				namespace: config.namespace,
				labels: {
					...commonLabels(config),
					"app.kubernetes.io/component": component,
				},
			},
			type: ServiceType.CLUSTER_IP,
			ports: [
				{
					name: "metrics",
					port: metricsPort,
					protocol: Protocol.TCP,
					targetPort: metricsPort,
				},
			],
			selector,
		});

		dualStack(ApiObject.of(svc));

		return svc;
	}
}
