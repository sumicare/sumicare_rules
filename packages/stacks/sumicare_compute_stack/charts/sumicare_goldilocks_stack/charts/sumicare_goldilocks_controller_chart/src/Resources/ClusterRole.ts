/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Controller/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export const GoldilocksControllerRbac = defineRbac<"controller">({
	name: "GoldilocksControllerRbac",
	serviceAccounts: ["controller"],
	roles: [
		{
			name: "goldilocks-controller",
			labels: { "app.kubernetes.io/component": "controller" },
			rules: [
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["appsAll"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["cronJobs", "jobs"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["namespaces", "pods"],
				},
				{
					verbs: ["get", "list", "create", "delete", "update"],
					endpoints: ["vpaVerticalPodAutoscalers"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["argoprojRollouts"],
				},
			],
			bind: ["controller"],
		},
	],
});

export type GoldilocksControllerRbacConstruct = InstanceType<
	typeof GoldilocksControllerRbac
>;

export function createGoldilocksControllerRbac(
	scope: Construct,
	config: Config,
): GoldilocksControllerRbacConstruct {
	return new GoldilocksControllerRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
		controller: config,
	});
}
