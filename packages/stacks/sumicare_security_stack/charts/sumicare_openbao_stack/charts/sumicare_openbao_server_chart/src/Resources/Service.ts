/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { ServerConfig } from "Openbao/Server/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { Pods, Service, ServiceType } from "cdk8s-plus-33";
import { Construct } from "constructs";

export class OpenbaoServerService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: ServerConfig) {
		super(scope, "server-service");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "server"),
		};

		this.service = new Service(this, "svc", {
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels,
			},
			ports: [
				{ name: "api", port: 8200, targetPort: 8200 },
				{ name: "cluster", port: 8201, targetPort: 8201 },
			],
			selector: Pods.select(this, "sel", {
				labels: { "app.kubernetes.io/name": config.name },
			}),
			type: ServiceType.CLUSTER_IP,
		});
	}
}

export class OpenbaoServerHeadlessService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: ServerConfig) {
		super(scope, "server-headless-service");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "server"),
		};

		this.service = new Service(this, "svc-headless", {
			metadata: {
				name: `${config.name}-internal`,
				namespace: config.namespace,
				labels,
			},
			ports: [
				{ name: "api", port: 8200, targetPort: 8200 },
				{ name: "cluster", port: 8201, targetPort: 8201 },
			],
			selector: Pods.select(this, "sel-headless", {
				labels: { "app.kubernetes.io/name": config.name },
			}),
			clusterIP: "None",
		});
	}
}

export class OpenbaoServerHaService extends Construct {
	readonly service: Service;

	constructor(scope: Construct, config: ServerConfig) {
		super(scope, "server-ha-service");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "server"),
		};

		this.service = new Service(this, "svc-ha-active", {
			metadata: {
				name: `${config.name}-active`,
				namespace: config.namespace,
				labels: {
					...labels,
					"openbao-active": "true",
				},
			},
			ports: [
				{ name: "api", port: 8200, targetPort: 8200 },
				{ name: "cluster", port: 8201, targetPort: 8201 },
			],
			selector: Pods.select(this, "sel-ha", {
				labels: {
					"app.kubernetes.io/name": config.name,
					"openbao-active": "true",
				},
			}),
		});
	}
}

export class OpenbaoServerStandbyService extends Construct {
	readonly service!: Service;

	constructor(scope: Construct, config: ServerConfig) {
		super(scope, "server-standby-service");

		if (!config.ha.enabled) return;

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "server"),
		};

		this.service = new Service(this, "svc-ha-standby", {
			metadata: {
				name: `${config.name}-standby`,
				namespace: config.namespace,
				labels: {
					...labels,
					"openbao-active": "false",
				},
			},
			ports: [
				{ name: "api", port: 8200, targetPort: 8200 },
				{ name: "cluster", port: 8201, targetPort: 8201 },
			],
			selector: Pods.select(this, "sel-ha-standby", {
				labels: {
					"app.kubernetes.io/name": config.name,
					"openbao-active": "false",
				},
			}),
		});
	}
}
