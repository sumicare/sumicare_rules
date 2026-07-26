/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Etcd/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates the headless Service for the etcd StatefulSet,
 * exposing client (2379) and peer (2380) ports.
 */
export class EtcdService extends Construct {
	readonly service: ApiObject;

	constructor(scope: Construct, config: Config) {
		super(scope, "service");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "etcd",
		};

		this.service = new ApiObject(this, "etcd-service", {
			apiVersion: "v1",
			kind: "Service",
			metadata: {
				name: "etcd",
				namespace: config.namespace,
				labels,
			},
			spec: {
				clusterIP: "None",
				ports: [
					{ name: "client", port: 2379 },
					{ name: "peer", port: 2380 },
				],
				selector: {
					"app.kubernetes.io/name": config.name,
					"app.kubernetes.io/component": "etcd",
				},
			},
		});
	}
}
