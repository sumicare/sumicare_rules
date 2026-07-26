/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Security/Openbao/Config";
import { KnownLatestOpenbaoChartVersion } from "Security/Openbao/Version";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

export class OpenbaoPodDisruptionBudget extends Construct {
	constructor(scope: Construct, config: Config) {
		super(scope, "pdb");

		const labels = {
			...commonLabels({
				name: config.name,
				version: KnownLatestOpenbaoChartVersion,
			}),
		};

		if (config.server.replicas > 1) {
			new ApiObject(this, "server-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: `${config.name}-server`,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "server",
					},
				},
				spec: {
					minAvailable: 1,
					selector: {
						matchLabels: {
							"app.kubernetes.io/name": config.name,
							"app.kubernetes.io/component": "server",
						},
					},
				},
			});
		}

		if (config.injector.enabled) {
			new ApiObject(this, "injector-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: `${config.name}-injector`,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "injector",
					},
				},
				spec: {
					minAvailable: 1,
					selector: {
						matchLabels: {
							"app.kubernetes.io/name": config.name,
							"app.kubernetes.io/component": "injector",
						},
					},
				},
			});
		}
	}
}
