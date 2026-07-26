/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Descheduler/Config";
import {
	commonLabels,
	dualStack,
	selectorLabels,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates a headless ClusterIP Service exposing the descheduler HTTPS
 * metrics and healthz endpoint. Configured for dual-stack IP families
 * (IPv4 + IPv6).
 */
export class DeschedulerService extends Construct {
	/** The CDK8s Service resource. */
	readonly service: Service;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed descheduler config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const selector = Pods.select(this, "service-selector", {
			labels: selectorLabels(config.name),
		});

		this.service = new Service(this, "service", {
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels: commonLabels(config),
			},
			type: ServiceType.CLUSTER_IP,
			clusterIP: "None",
			ports: [
				{
					name: "https-metrics",
					port: config.metricsPort,
					protocol: Protocol.TCP,
					targetPort: config.metricsPort,
				},
			],
			selector,
		});

		dualStack(ApiObject.of(this.service));
	}
}
