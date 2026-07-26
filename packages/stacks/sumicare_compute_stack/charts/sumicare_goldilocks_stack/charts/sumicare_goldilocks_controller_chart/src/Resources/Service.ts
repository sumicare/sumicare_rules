/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Controller/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates the controller metrics Service, exposing the
 * /metrics endpoint for Prometheus scraping.
 * Configured for dual-stack IP families (IPv4 + IPv6).
 */
export class GoldilocksControllerService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const selector = Pods.select(this, "controller-selector", {
			labels: componentLabels(config.name, "controller"),
		});

		const svc = new Service(this, "controller-metrics-service", {
			metadata: {
				name: `${config.name}-controller-metrics`,
				namespace: config.namespace,
				labels: {
					...commonLabels(config),
					"app.kubernetes.io/component": "controller",
				},
			},
			type: ServiceType.CLUSTER_IP,
			ports: [
				{
					name: "metrics",
					port: 8080,
					protocol: Protocol.TCP,
					targetPort: 8080,
				},
			],
			selector,
		});

		dualStack(ApiObject.of(svc));

		this.service = svc;
	}
}
