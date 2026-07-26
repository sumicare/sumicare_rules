/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates Services for KEDA components:
 * - Operator metrics service (port 9666)
 * - Metrics server service (port 443 -> 6443, plus metrics port 8080)
 * - Admission webhooks service (port 443 -> 9443)
 *
 * All Services are configured for dual-stack IP families (IPv4 + IPv6).
 */
export class KedaService extends Construct {
	/** The operator Service. */
	readonly operatorService: Service;
	/** The metrics server Service, or undefined if disabled. */
	readonly metricsServerService: Service | undefined;
	/** The admission webhooks Service, or undefined if disabled. */
	readonly webhooksService: Service | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed KEDA config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "services");

		const labels = commonLabels(config);

		const operatorSelector = Pods.select(this, "operator-selector", {
			labels: componentLabels(config.name, "operator"),
		});

		this.operatorService = new Service(this, "operator-service", {
			metadata: {
				name: config.operator.name,
				namespace: config.namespace,
				labels: {
					...labels,
					"app.kubernetes.io/component": "operator",
				},
			},
			type: ServiceType.CLUSTER_IP,
			ports: [
				{
					name: "metricsservice",
					port: 9666,
					protocol: Protocol.TCP,
					targetPort: 9666,
				},
			],
			selector: operatorSelector,
		});

		dualStack(ApiObject.of(this.operatorService));

		if (config.metricsServer.enabled) {
			const metricsSelector = Pods.select(this, "metrics-server-selector", {
				labels: componentLabels(config.name, "metrics-server"),
			});

			this.metricsServerService = new Service(this, "metrics-server-service", {
				metadata: {
					name: `${config.operator.name}-metrics-apiserver`,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "metrics-server",
					},
				},
				type: ServiceType.CLUSTER_IP,
				ports: [
					{
						name: "https",
						port: config.service.portHttps,
						protocol: Protocol.TCP,
						targetPort: config.service.portHttpsTarget,
					},
					{
						name: "metrics",
						port: 8080,
						protocol: Protocol.TCP,
						targetPort: 8080,
					},
				],
				selector: metricsSelector,
			});

			dualStack(ApiObject.of(this.metricsServerService));
		}

		if (config.webhooks.enabled) {
			const webhooksSelector = Pods.select(this, "webhooks-selector", {
				labels: componentLabels(config.name, "webhooks"),
			});

			this.webhooksService = new Service(this, "webhooks-service", {
				metadata: {
					name: config.webhooks.name,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "webhooks",
					},
				},
				type: ServiceType.CLUSTER_IP,
				ports: [
					{
						name: "https",
						port: 443,
						protocol: Protocol.TCP,
						targetPort: config.webhooks.port,
					},
				],
				selector: webhooksSelector,
			});

			dualStack(ApiObject.of(this.webhooksService));
		}
	}
}
