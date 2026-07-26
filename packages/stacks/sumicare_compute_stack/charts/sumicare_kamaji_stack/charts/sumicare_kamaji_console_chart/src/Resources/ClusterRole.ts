/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Console/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export type ConsoleSa = "console";

export const ConsoleRbac = defineRbac<ConsoleSa>({
	name: "ConsoleRbac",
	serviceAccounts: ["console"],
	roles: [
		{
			name: "kamaji-console",
			rules: [
				{
					verbs: ["get", "list", "watch"],
					endpoints: [
						"namespaces",
						"deployments",
						"replicaSets",
						"services",
						"pods",
						"secrets",
						"configMaps",
					],
				},
				{
					verbs: [
						"create",
						"delete",
						"get",
						"list",
						"patch",
						"update",
						"watch",
					],
					endpoints: ["kamajiTenantControlPlanes", "kamajiDatastores"],
				},
			],
			bind: ["console"],
		},
	],
});

export type ConsoleRbacConstruct = InstanceType<typeof ConsoleRbac>;

export function createConsoleRbac(
	scope: Construct,
	config: Config,
): ConsoleRbacConstruct {
	return new ConsoleRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: {
			...commonLabels(config),
			"app.kubernetes.io/component": "console",
		},
	});
}
