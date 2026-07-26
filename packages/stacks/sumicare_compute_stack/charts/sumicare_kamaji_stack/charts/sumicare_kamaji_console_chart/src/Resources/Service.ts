/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Console/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates a ClusterIP Service for the Kamaji Console UI,
 * exposing port 80 -> targetPort 3000.
 */
export class ConsoleService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "console",
		};

		const selector = Pods.select(this, "selector", {
			labels: componentLabels(config.name, "console"),
		});

		this.service = new Service(this, "console-service", {
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels,
			},
			type: ServiceType.CLUSTER_IP,
			ports: [
				{
					name: "http",
					port: 80,
					protocol: Protocol.TCP,
					targetPort: 3000,
				},
			],
			selector,
		});

		dualStack(ApiObject.of(this.service));
	}
}
