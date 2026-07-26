/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import {
	commonLabels,
	componentLabels,
	dualStack,
} from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Pods, Protocol, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates Services for the Kamaji controller: a webhook service exposing
 * the webhook server on port 443, and a metrics service exposing the
 * metrics endpoint on port 8080. Both are ClusterIP and dual-stack.
 */
export class KamajiService extends Construct {
	readonly webhookService: Service;
	readonly metricsService: Service;

	constructor(scope: Construct, config: Config) {
		super(scope, "services");

		this.webhookService = this.createService(
			"webhook-service",
			`${config.name}-webhook-service`,
			config,
			"controller",
			"webhook-server",
			443,
			9443,
		);

		this.metricsService = this.createService(
			"metrics-service",
			`${config.name}-metrics-service`,
			config,
			"controller",
			"metrics",
			8080,
			8080,
		);
	}

	private createService(
		id: string,
		name: string,
		config: Config,
		component: string,
		portName: string,
		port: number,
		targetPort: number,
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
					name: portName,
					port,
					protocol: Protocol.TCP,
					targetPort,
				},
			],
			selector,
		});

		dualStack(ApiObject.of(svc));

		return svc;
	}
}
