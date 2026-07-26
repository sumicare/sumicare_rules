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

export class OpenbaoServiceMonitor extends Construct {
	constructor(scope: Construct, config: Config) {
		super(scope, "service-monitor");

		if (!config.monitoring.serviceMonitors.enabled) return;

		const labels = {
			...commonLabels({
				name: config.name,
				version: KnownLatestOpenbaoChartVersion,
			}),
		};

		new ApiObject(this, "server-sm", {
			apiVersion: "monitoring.coreos.com/v1",
			kind: "ServiceMonitor",
			metadata: {
				name: `${config.name}-server`,
				namespace: config.namespace,
				labels: {
					...labels,
					"app.kubernetes.io/component": "server",
				},
			},
			spec: {
				selector: {
					matchLabels: {
						"app.kubernetes.io/name": config.name,
						"app.kubernetes.io/component": "server",
					},
				},
				endpoints: [
					{
						port: "api",
						path: "/v1/sys/metrics",
						params: {
							format: ["prometheus"],
						},
					},
				],
			},
		});

		if (config.injector.enabled) {
			new ApiObject(this, "injector-sm", {
				apiVersion: "monitoring.coreos.com/v1",
				kind: "ServiceMonitor",
				metadata: {
					name: `${config.name}-injector`,
					namespace: config.namespace,
					labels: {
						...labels,
						"app.kubernetes.io/component": "injector",
					},
				},
				spec: {
					selector: {
						matchLabels: {
							"app.kubernetes.io/name": config.name,
							"app.kubernetes.io/component": "injector",
						},
					},
					endpoints: [
						{
							port: "https",
							path: "/metrics",
							scheme: "https",
							tlsConfig: {
								insecureSkipVerify: true,
							},
						},
					],
				},
			});
		}
	}
}
