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

export class OpenbaoPrometheusRule extends Construct {
	constructor(scope: Construct, config: Config) {
		super(scope, "prometheus-rule");

		if (!config.monitoring.prometheusRules.enabled) return;

		const labels = {
			...commonLabels({
				name: config.name,
				version: KnownLatestOpenbaoChartVersion,
			}),
		};

		new ApiObject(this, "rule", {
			apiVersion: "monitoring.coreos.com/v1",
			kind: "PrometheusRule",
			metadata: {
				name: `${config.name}-rules`,
				namespace: config.namespace,
				labels,
			},
			spec: {
				groups: [
					{
						name: `${config.name}-server`,
						rules: [
							{
								alert: "OpenBaoServerDown",
								expr: `up{job="${config.name}-server"} == 0`,
								for: "5m",
								labels: {
									severity: "critical",
								},
								annotations: {
									summary: "OpenBao server is down",
									description:
										"OpenBao server {{ $labels.instance }} has been down for more than 5 minutes.",
								},
							},
							{
								alert: "OpenBaoSealed",
								expr: `bao_core_unsealed{job="${config.name}-server"} == 0`,
								for: "5m",
								labels: {
									severity: "warning",
								},
								annotations: {
									summary: "OpenBao is sealed",
									description:
										"OpenBao server {{ $labels.instance }} is sealed.",
								},
							},
						],
					},
				],
			},
		});
	}
}
