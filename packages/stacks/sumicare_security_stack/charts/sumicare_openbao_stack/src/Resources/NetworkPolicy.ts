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

export class OpenbaoNetworkPolicy extends Construct {
	constructor(scope: Construct, config: Config) {
		super(scope, "network-policy");

		if (!config.networkPolicy.enabled) return;

		const baseLabels = commonLabels({
			name: config.name,
			version: KnownLatestOpenbaoChartVersion,
		});

		new ApiObject(this, "server-np", {
			apiVersion: "networking.k8s.io/v1",
			kind: "NetworkPolicy",
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels: {
					...baseLabels,
					"app.kubernetes.io/component": "server",
				},
			},
			spec: {
				podSelector: {
					matchLabels: {
						"app.kubernetes.io/name": config.name,
						"app.kubernetes.io/component": "server",
					},
				},
				ingress: [
					{
						from: [{ namespaceSelector: {} }],
						ports: [
							{ port: 8200, protocol: "TCP" },
							{ port: 8201, protocol: "TCP" },
						],
					},
				],
			},
		});

		if (config.injector.enabled) {
			new ApiObject(this, "injector-np", {
				apiVersion: "networking.k8s.io/v1",
				kind: "NetworkPolicy",
				metadata: {
					name: `${config.name}-agent-injector`,
					namespace: config.namespace,
					labels: {
						...baseLabels,
						"app.kubernetes.io/component": "injector",
					},
				},
				spec: {
					podSelector: {
						matchLabels: {
							"app.kubernetes.io/name": config.name,
							"app.kubernetes.io/component": "injector",
						},
					},
					ingress: [
						{
							from: [{ namespaceSelector: {} }],
							ports: [{ port: 8080, protocol: "TCP" }],
						},
					],
				},
			});
		}
	}
}
