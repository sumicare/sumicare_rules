/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export type KamajiSa = "kamaji";

export const KamajiRbac = defineRbac<KamajiSa>({
	name: "KamajiRbac",
	serviceAccounts: ["kamaji"],
	roles: [
		{
			name: "kamaji-manager-role",
			rules: [
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
					endpoints: ["deployments"],
				},
				{
					verbs: ["create", "delete", "get", "list", "watch"],
					endpoints: ["jobs"],
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
					endpoints: ["configMaps"],
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
					endpoints: ["secrets"],
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
					endpoints: ["services"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["namespaces"],
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
					endpoints: ["kamajiDatastores"],
				},
				{
					verbs: ["get", "patch", "update"],
					endpoints: ["kamajiDatastoresStatus"],
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
					endpoints: ["kamajiTenantControlPlanes"],
				},
				{
					verbs: ["update"],
					endpoints: ["kamajiTenantControlPlanesFinalizers"],
				},
				{
					verbs: ["get", "patch", "update"],
					endpoints: ["kamajiTenantControlPlanesStatus"],
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
					endpoints: ["ingresses"],
				},
				{
					verbs: ["create", "get", "list", "patch", "update", "watch"],
					endpoints: ["kamajiKubeconfigGenerators"],
				},
				{
					verbs: ["get", "patch", "update"],
					endpoints: ["kamajiKubeconfigGeneratorsStatus"],
				},
				{
					verbs: ["update"],
					endpoints: ["kamajiKubeconfigGeneratorsFinalizers"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["gatewayGateways"],
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
					endpoints: [
						"gatewayGrpcRoutes",
						"gatewayHttpRoutes",
						"gatewayTlsRoutes",
					],
				},
				{
					verbs: ["get", "list"],
					endpoints: ["metricsPods"],
				},
			],
			bind: ["kamaji"],
		},
		{
			name: "kamaji-metrics-reader",
			rules: [
				{
					verbs: ["get", "list"],
					endpoints: ["metricsPods"],
				},
			],
			bind: ["kamaji"],
		},
		{
			name: "kamaji-proxy-role",
			rules: [
				{
					verbs: ["create"],
					endpoints: ["tokenReviews"],
				},
				{
					verbs: ["create"],
					endpoints: ["subjectAccessReviews"],
				},
			],
			bind: ["kamaji"],
		},
		{
			name: "kamaji-leader-election-role",
			scope: "namespace",
			rules: [
				{
					verbs: [
						"get",
						"list",
						"watch",
						"create",
						"update",
						"patch",
						"delete",
					],
					endpoints: ["configMaps"],
				},
				{
					verbs: [
						"get",
						"list",
						"watch",
						"create",
						"update",
						"patch",
						"delete",
					],
					endpoints: ["leases"],
				},
				{
					verbs: ["create", "patch"],
					endpoints: ["events"],
				},
			],
			bind: ["kamaji"],
		},
	],
});

export type KamajiRbacConstruct = InstanceType<typeof KamajiRbac>;

export function createKamajiRbac(
	scope: Construct,
	config: Config,
): KamajiRbacConstruct {
	return new KamajiRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
	});
}
