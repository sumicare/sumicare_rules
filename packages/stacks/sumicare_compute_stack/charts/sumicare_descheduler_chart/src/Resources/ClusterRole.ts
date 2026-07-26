/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Descheduler/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

type DeschedulerRbacProps = {
	leaderElection?: {
		enabled?: boolean;
		resourceName?: string;
	};
};

export const DeschedulerRbac = defineRbac<"descheduler", DeschedulerRbacProps>({
	name: "DeschedulerRbac",
	serviceAccounts: ["descheduler"],
	roles: [
		{
			name: "descheduler",
			rules: [
				{
					verbs: ["create", "update"],
					endpoints: ["eventsK8sIo"],
				},
				{ verbs: ["get", "watch", "list"], endpoints: ["nodes"] },
				{ verbs: ["get", "watch", "list"], endpoints: ["namespaces"] },
				{ verbs: ["get", "watch", "list"], endpoints: ["pods"] },
				{ verbs: ["create"], endpoints: ["podsEviction"] },
				{
					verbs: ["get", "watch", "list"],
					endpoints: ["schedulingPriorityClasses"],
				},
				{
					verbs: ["get", "watch", "list"],
					endpoints: ["podDisruptionBudgets"],
				},
				{
					verbs: ["get", "watch", "list"],
					endpoints: ["persistentVolumeClaims"],
				},
				{
					verbs: ["create", "update"],
					endpoints: ["leases"],
					when: (props) => props.leaderElection?.enabled === true,
				},
				{
					verbs: ["get", "patch", "delete"],
					endpoints: ["leases"],
					resourceNames: (props) => [
						props.leaderElection?.resourceName ?? "descheduler",
					],
					when: (props) => props.leaderElection?.enabled === true,
				},
			],
			bind: ["descheduler"],
		},
	],
});

export type DeschedulerRbacConstruct = InstanceType<typeof DeschedulerRbac>;

export function createDeschedulerRbac(
	scope: Construct,
	config: Config,
): DeschedulerRbacConstruct {
	return new DeschedulerRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
		leaderElection: config.leaderElection,
	});
}
