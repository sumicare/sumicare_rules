/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Dashboard/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates the dashboard Service, exposing the HTTP endpoint.
 * Configured for dual-stack IP families (IPv4 + IPv6).
 */
export class GoldilocksDashboardService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "dashboard",
		};

		const selector = Pods.select(this, "dashboard-selector", {
			labels: componentLabels(config.name, "dashboard"),
		});

		const typeMap: Record<string, ServiceType> = {
			ClusterIP: ServiceType.CLUSTER_IP,
			NodePort: ServiceType.NODE_PORT,
			LoadBalancer: ServiceType.LOAD_BALANCER,
		};

		const svc = new Service(this, "dashboard-service", {
			metadata: {
				name: `${config.name}-dashboard`,
				namespace: config.namespace,
				labels,
				annotations: config.service.annotations,
			},
			type: typeMap[config.service.type],
			ports: [
				{
					name: "http",
					port: config.service.port,
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
