/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Etcd/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export type EtcdSa = "etcd";

export const EtcdRbac = defineRbac<EtcdSa>({
	name: "EtcdRbac",
	serviceAccounts: ["etcd"],
	roles: [
		{
			name: "etcd-gen-certs-role",
			scope: "namespace",
			labels: { "app.kubernetes.io/component": "etcd" },
			rules: [
				{
					verbs: ["get", "delete"],
					endpoints: ["secrets"],
					resourceNames: ["etcd-certs", "root-client-certs"],
				},
				{
					verbs: ["create"],
					endpoints: ["secrets"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["statefulSets"],
				},
			],
			bind: ["etcd"],
		},
	],
});

export type EtcdRbacConstruct = InstanceType<typeof EtcdRbac>;

export function createEtcdRbac(
	scope: Construct,
	config: Config,
): EtcdRbacConstruct {
	return new EtcdRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: {
			...commonLabels(config),
			"app.kubernetes.io/component": "etcd",
		},
	});
}
