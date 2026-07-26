/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";

import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import type { Construct } from "constructs";

export type VpaSa = "recommender" | "updater" | "admissionController";

export const VpaRbac = defineRbac<VpaSa>({
	name: "VpaRbac",
	serviceAccounts: ["recommender", "updater", "admissionController"],
	roles: [
		{
			name: "vpa-admission-controller",
			rules: [
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["pods", "configMaps", "nodes", "limitRanges"],
				},
				{
					verbs: ["create", "delete", "get", "list", "patch"],
					endpoints: ["mutatingWebhookConfigurations"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: [
						"vpaPocVerticalPodAutoscalers",
						"vpaVerticalPodAutoscalers",
					],
				},
				{
					verbs: ["create", "update", "get", "list", "watch"],
					endpoints: ["leases"],
				},
			],
			bind: ["admissionController"],
		},
		{
			name: "vpa-metrics-reader",
			rules: [{ verbs: ["get", "list"], endpoints: ["metricsPods"] }],
			bind: ["recommender"],
		},
		{
			name: "vpa-actor",
			rules: [
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["pods", "nodes", "limitRanges"],
				},
				{
					verbs: ["create", "get", "list", "watch", "patch", "update"],
					endpoints: ["events"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["vpaPocVerticalPodAutoscalers"],
				},
				{
					verbs: ["get", "list", "watch", "patch"],
					endpoints: ["vpaVerticalPodAutoscalers"],
				},
			],
			bind: ["recommender", "updater"],
		},
		{
			name: "vpa-status-actor",
			rules: [{ verbs: ["get", "patch"], endpoints: ["vpaStatus"] }],
			bind: ["recommender"],
		},
		{
			name: "vpa-checkpoint-actor",
			rules: [
				{
					verbs: ["get", "list", "watch", "create", "patch", "delete"],
					endpoints: ["vpaPocCheckpoints", "vpaCheckpoints"],
				},
				{
					verbs: ["get", "list"],
					endpoints: ["namespaces"],
				},
			],
			bind: ["recommender"],
		},
		{
			name: "vpa-evictioner",
			rules: [
				{
					verbs: ["get"],
					endpoints: ["appsReplicasets", "extensionsReplicasets"],
				},
				{ verbs: ["create"], endpoints: ["podsEviction"] },
			],
			bind: ["updater"],
		},
		{
			name: "vpa-target-reader",
			rules: [
				{
					verbs: ["get", "watch"],
					endpoints: ["scaleAll"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["replicationControllers"],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: [
						"daemonSets",
						"deployments",
						"appsReplicasets",
						"statefulSets",
					],
				},
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["jobs", "cronJobs"],
				},
			],
			bind: ["recommender", "admissionController", "updater"],
		},
		{
			name: "vpa-status-reader",
			rules: [{ verbs: ["get", "list", "watch"], endpoints: ["leases"] }],
			bind: ["updater"],
		},
		{
			name: "vpa-updater-in-place",
			rules: [{ verbs: ["patch"], endpoints: ["podsResize", "pods"] }],
			bind: ["updater"],
		},
		{
			name: "system:leader-locking-vpa-updater",
			scope: "namespace",
			rules: [
				{ verbs: ["create"], endpoints: ["leases"] },
				{
					verbs: ["get", "watch", "update"],
					endpoints: ["leases"],
					resourceNames: ["vpa-updater", "vpa-updater-lease"],
				},
			],
			bind: ["updater"],
		},
		{
			name: "system:leader-locking-vpa-recommender",
			scope: "namespace",
			rules: [
				{ verbs: ["create"], endpoints: ["leases"] },
				{
					verbs: ["get", "watch", "update"],
					endpoints: ["leases"],
					resourceNames: ["vpa-recommender", "vpa-recommender-lease"],
				},
			],
			bind: ["recommender"],
		},
	],
});

export type VpaRbacConstruct = InstanceType<typeof VpaRbac>;

export function createVpaRbac(
	scope: Construct,
	config: Config,
): VpaRbacConstruct {
	const rbac = new VpaRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
	});

	return rbac;
}
