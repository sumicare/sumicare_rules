/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import { commonLabels, defineRbac } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import type { Construct } from "constructs";

type KedaRbacProps = {
	certificatesSecretName: string;
};

export const KedaRbac = defineRbac<
	"operator" | "metricsServer" | "webhooks",
	KedaRbacProps
>({
	name: "KedaRbac",
	serviceAccounts: ["operator", "metricsServer", "webhooks"],
	roles: [
		{
			name: "keda-operator",
			rules: [
				{ verbs: ["get", "list", "watch"], endpoints: ["configMaps"] },
				{
					verbs: ["get", "list", "watch"],
					endpoints: ["configMapsStatus"],
				},
				{ verbs: ["get", "list", "watch"], endpoints: ["limitRanges"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["pods"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["services"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["serviceAccounts"] },
				{ verbs: ["create", "patch"], endpoints: ["events"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["endpointSlices"] },
				{ verbs: ["list", "watch"], endpoints: ["secrets"] },
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: ["scaleAll"],
				},
				{ verbs: ["get"], endpoints: ["allResources"] },
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: ["deploymentsScale", "statefulSetsScale"],
				},
				{ verbs: ["get", "list", "watch"], endpoints: ["deployments"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["statefulSets"] },
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
					endpoints: ["horizontalPodAutoscalers"],
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
					endpoints: ["jobs"],
				},
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: [
						"kedaCloudEventSources",
						"kedaCloudEventSourcesStatus",
						"kedaClusterCloudEventSources",
						"kedaClusterCloudEventSourcesStatus",
					],
				},
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: [
						"kedaScaledJobs",
						"kedaScaledJobsFinalizers",
						"kedaScaledJobsStatus",
						"kedaScaledObjects",
						"kedaScaledObjectsFinalizers",
						"kedaScaledObjectsStatus",
						"kedaTriggerAuthentications",
						"kedaTriggerAuthenticationsStatus",
					],
				},
			],
			bind: ["operator"],
		},
		{
			name: "keda-operator-minimal-cluster-role",
			rules: [
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: [
						"kedaClusterTriggerAuthentications",
						"kedaClusterTriggerAuthenticationsStatus",
					],
				},
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: ["validatingWebhookConfigurations"],
				},
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: ["apiServices"],
				},
				{
					verbs: ["get", "list", "patch", "update", "watch"],
					endpoints: [
						"kedaCloudEventSources",
						"kedaCloudEventSourcesStatus",
						"kedaClusterCloudEventSources",
						"kedaClusterCloudEventSourcesStatus",
					],
				},
			],
			bind: ["operator"],
		},
		{
			name: "keda-operator-external-metrics-reader",
			rules: [
				{
					verbs: ["get"],
					endpoints: ["kedaExternalMetrics"],
				},
			],
		},
		{
			name: "keda-operator-webhook",
			labels: { "app.kubernetes.io/component": "webhook" },
			rules: [
				{ verbs: ["list", "watch"], endpoints: ["horizontalPodAutoscalers"] },
				{
					verbs: ["list", "watch"],
					endpoints: ["kedaScaledObjects"],
				},
				{ verbs: ["get", "list", "watch"], endpoints: ["deployments"] },
				{ verbs: ["get", "list", "watch"], endpoints: ["statefulSets"] },
				{ verbs: ["list"], endpoints: ["limitRanges"] },
			],
			bind: ["webhooks"],
		},
		{
			name: "keda-operator-certs",
			scope: "namespace",
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
					endpoints: ["leases"],
				},
				{
					verbs: ["get"],
					endpoints: ["secrets"],
					resourceNames: (props) => [props.certificatesSecretName],
				},
				{ verbs: ["create", "update"], endpoints: ["secrets"] },
			],
			bind: ["operator"],
		},
	],
});

export type KedaRbacConstruct = InstanceType<typeof KedaRbac>;

export function createKedaRbac(
	scope: Construct,
	config: Config,
): KedaRbacConstruct {
	const rbac = new KedaRbac(scope, "rbac", {
		name: config.name,
		namespace: config.namespace,
		labels: commonLabels(config),
		certificatesSecretName: config.certificates.secretName,
	});

	const labels = commonLabels(config);

	// ClusterRoleBinding: keda-operator-system-auth-delegator
	// Binds keda-metrics-server SA to the system:auth-delegator ClusterRole
	new ApiObject(rbac, "crb-auth-delegator", {
		apiVersion: "rbac.authorization.k8s.io/v1",
		kind: "ClusterRoleBinding",
		metadata: {
			name: "keda-operator-system-auth-delegator",
			labels: {
				...labels,
				"app.kubernetes.io/component": "metrics-server",
			},
		},
		roleRef: {
			apiGroup: "rbac.authorization.k8s.io",
			kind: "ClusterRole",
			name: "system:auth-delegator",
		},
		subjects: [
			{
				kind: "ServiceAccount",
				name: rbac.serviceAccounts.metricsServer.name,
				namespace: config.namespace,
			},
		],
	});

	// ClusterRoleBinding: keda-operator-hpa-controller-external-metrics
	// Binds horizontal-pod-autoscaler SA in kube-system to our external-metrics-reader ClusterRole
	const externalMetricsReader = rbac.clusterRoles.get(
		"keda-operator-external-metrics-reader",
	);
	if (externalMetricsReader) {
		new ApiObject(rbac, "crb-hpa-external-metrics", {
			apiVersion: "rbac.authorization.k8s.io/v1",
			kind: "ClusterRoleBinding",
			metadata: {
				name: "keda-operator-hpa-controller-external-metrics",
				labels: {
					...labels,
					"app.kubernetes.io/component": "metrics-server",
				},
			},
			roleRef: {
				apiGroup: "rbac.authorization.k8s.io",
				kind: "ClusterRole",
				name: "keda-operator-external-metrics-reader",
			},
			subjects: [
				{
					kind: "ServiceAccount",
					name: "horizontal-pod-autoscaler",
					namespace: "kube-system",
				},
			],
		});
	}

	// RoleBinding: keda-operator-auth-reader
	// Binds keda-metrics-server SA to extension-apiserver-authentication-reader Role in kube-system
	new ApiObject(rbac, "rb-auth-reader", {
		apiVersion: "rbac.authorization.k8s.io/v1",
		kind: "RoleBinding",
		metadata: {
			name: "keda-operator-auth-reader",
			namespace: "kube-system",
			labels: {
				...labels,
				"app.kubernetes.io/component": "metrics-server",
			},
		},
		roleRef: {
			apiGroup: "rbac.authorization.k8s.io",
			kind: "Role",
			name: "extension-apiserver-authentication-reader",
		},
		subjects: [
			{
				kind: "ServiceAccount",
				name: rbac.serviceAccounts.metricsServer.name,
				namespace: config.namespace,
			},
		],
	});

	return rbac;
}
