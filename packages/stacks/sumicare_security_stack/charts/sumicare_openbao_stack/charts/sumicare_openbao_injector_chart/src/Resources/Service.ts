/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Openbao/Injector/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { Pods, Service } from "cdk8s-plus-33";
import { Construct } from "constructs";

export class OpenbaoInjectorService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: Config) {
		super(scope, "injector-service");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "injector"),
		};

		this.service = new Service(this, "svc", {
			metadata: {
				name: `${config.name}-agent-injector-svc`,
				namespace: config.namespace,
				labels,
			},
			ports: [{ name: "https", port: 443, targetPort: config.port }],
			selector: Pods.select(this, "sel", {
				labels: {
					"app.kubernetes.io/name": config.name,
					"app.kubernetes.io/component": "injector",
				},
			}),
		});
	}
}
