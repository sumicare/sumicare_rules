/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Security/Openbao/Config";
import { KnownLatestOpenbaoChartVersion } from "Security/Openbao/Version";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import {
	ApiResource,
	ClusterRole,
	ClusterRoleBinding,
	type IServiceAccount,
} from "cdk8s-plus-33";
import type { Construct } from "constructs";

const serviceAccountToken = ApiResource.custom({
	apiGroup: "",
	resourceType: "serviceaccounts/token",
});

export const OpenbaoRbac = defineRbac<
	"server" | "injector" | "csi" | "snapshot",
	{
		haEnabled?: boolean;
		injectorEnabled?: boolean;
		csiEnabled?: boolean;
		snapshotEnabled?: boolean;
	}
>({
	name: "OpenbaoRbac",
	serviceAccounts: ["server", "injector", "csi", "snapshot"],
	roles: [
		{
			name: "openbao-server-discovery",
			scope: "namespace",
			labels: { "app.kubernetes.io/component": "server" },
			rules: [
				{
					verbs: ["get", "watch", "list", "update", "patch"],
					endpoints: ["pods"],
					when: (props) => props.haEnabled === true,
				},
			],
			bind: ["server"],
			when: (props) => props.haEnabled === true,
		},
		{
			name: "openbao-agent-injector-clusterrole",
			labels: { "app.kubernetes.io/component": "injector" },
			rules: [
				{
					verbs: ["get", "list", "watch", "patch"],
					endpoints: ["mutatingWebhookConfigurations"],
				},
				{
					verbs: ["get"],
					endpoints: ["nodes"],
				},
			],
			bind: ["injector"],
			when: (props) => props.injectorEnabled !== false,
		},
		{
			name: "openbao-agent-injector-leader-elector",
			scope: "namespace",
			labels: { "app.kubernetes.io/component": "injector" },
			rules: [
				{
					verbs: ["create", "get", "watch", "list", "update"],
					endpoints: ["secrets", "configMaps"],
				},
				{
					verbs: ["get", "patch", "delete"],
					endpoints: ["pods"],
				},
			],
			bind: ["injector"],
			when: (props) => props.injectorEnabled !== false,
		},
		{
			name: "openbao-csi-provider-clusterrole",
			labels: { "app.kubernetes.io/component": "csi" },
			rules: [
				{
					verbs: ["create"],
					endpoints: [serviceAccountToken],
				},
			],
			bind: ["csi"],
			when: (props) => props.csiEnabled !== false,
		},
		{
			name: "openbao-csi-provider-role",
			scope: "namespace",
			labels: { "app.kubernetes.io/component": "csi" },
			rules: [
				{
					verbs: ["get"],
					endpoints: ["secrets"],
					resourceNames: () => ["openbao-csi-provider-hmac-key"],
				},
				{
					verbs: ["create"],
					endpoints: ["secrets"],
				},
			],
			bind: ["csi"],
			when: (props) => props.csiEnabled !== false,
		},
		{
			name: "openbao-snapshot-role",
			scope: "namespace",
			labels: { "app.kubernetes.io/component": "snapshot" },
			rules: [
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["secrets"],
				},
				{
					verbs: ["create", "patch"],
					endpoints: ["events"],
				},
			],
			bind: ["snapshot"],
			when: (props) => props.snapshotEnabled === true,
		},
	],
});

export type OpenbaoRbacConstruct = InstanceType<typeof OpenbaoRbac>;

function bindAuthDelegator(
	scope: Construct,
	config: Config,
	serverSa: IServiceAccount,
): void {
	const labels = {
		...commonLabels({
			name: config.name,
			version: KnownLatestOpenbaoChartVersion,
		}),
		"app.kubernetes.io/component": "server",
	};

	const crb = new ClusterRoleBinding(scope, "auth-delegator-binding", {
		metadata: {
			name: `${config.name}-server-auth-delegator`,
			labels,
		},
		role: ClusterRole.fromClusterRoleName(
			scope,
			"auth-delegator-role",
			"system:auth-delegator",
		),
	});
	crb.addSubjects(serverSa);
}

export function createOpenbaoRbac(
	scope: Construct,
	config: Config,
): OpenbaoRbacConstruct {
	const rbac = new OpenbaoRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels({
			name: config.name,
			version: KnownLatestOpenbaoChartVersion,
		}),
		haEnabled: config.server.ha.enabled,
		injectorEnabled: config.injector.enabled,
		csiEnabled: config.csi.enabled,
		snapshotEnabled: config.snapshotAgent?.enabled ?? false,
	});

	bindAuthDelegator(scope, config, rbac.serviceAccounts.server);

	return rbac;
}
