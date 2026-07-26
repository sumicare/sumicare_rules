/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Dashboard/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export const GoldilocksDashboardRbac = defineRbac<"dashboard">({
	name: "GoldilocksDashboardRbac",
	serviceAccounts: ["dashboard"],
	roles: [
		{
			name: "goldilocks-dashboard",
			labels: { "app.kubernetes.io/component": "dashboard" },
			rules: [
				{
					verbs: ["get", "list"],
					endpoints: ["vpaVerticalPodAutoscalers"],
				},
				{
					verbs: ["get", "list"],
					endpoints: ["appsAll"],
				},
				{
					verbs: ["get", "list"],
					endpoints: ["namespaces", "pods"],
				},
				{
					verbs: ["get", "list"],
					endpoints: ["argoprojRollouts"],
				},
			],
			bind: ["dashboard"],
		},
	],
});

export type GoldilocksDashboardRbacConstruct = InstanceType<
	typeof GoldilocksDashboardRbac
>;

export function createGoldilocksDashboardRbac(
	scope: Construct,
	config: Config,
): GoldilocksDashboardRbacConstruct {
	return new GoldilocksDashboardRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
		dashboard: config,
	});
}
