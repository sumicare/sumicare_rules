/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	DeschedulerConfigError,
	DeschedulerConfigSchema,
	deschedulerConfig,
} from "Compute/Descheduler/Config";
import {
	createDeschedulerDeployment,
	createDeschedulerRbac,
	DeschedulerPolicyConfigMap,
	DeschedulerService,
} from "Compute/Descheduler/Resources";
import {
	KnownLatestDeschedulerVersion,
	LatestDeschedulerVersion,
} from "Compute/Descheduler/Version";

import { defineChart } from "@sumicare/chart-commons";
import {
	defineCiliumPolicy,
	defineHpa,
	defineIstioAuth,
	defineIstioMesh,
	definePodDisruptionBudget,
	defineSecretProviderClass,
	defineServiceMonitor,
	defineVpa,
} from "@sumicare/chart-commons/crds";

const { Chart: DeschedulerChart, Builder: DeschedulerChartBuilder } =
	defineChart<
		typeof DeschedulerConfigSchema,
		typeof DeschedulerConfigError,
		Config
	>({
		chartName: "DeschedulerChart",
		configSchema: DeschedulerConfigSchema,
		configError: DeschedulerConfigError,
		resolveConfig: deschedulerConfig.resolveConfig,
		latestVersion: LatestDeschedulerVersion,
		render: (self, config) => {
			const rbac = createDeschedulerRbac(self, config);
			const configMap = new DeschedulerPolicyConfigMap(self, config);
			createDeschedulerDeployment(
				self,
				config,
				rbac.serviceAccounts.descheduler,
				configMap.configMap,
			);
			new DeschedulerService(self, config);
			definePodDisruptionBudget({
				scope: self,
				id: "pod-disruption-budget",
				name: config.name,
				namespace: config.namespace,
				version: config.version,
				minAvailable: 1,
			});

			if (config.ciliumPolicy.enabled) {
				defineCiliumPolicy({
					scope: self,
					id: "descheduler-cilium-policy",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					enableDefaultDeny: config.ciliumPolicy.enableDefaultDeny,
					ingress: config.ciliumPolicy.ingress,
					egress: config.ciliumPolicy.egress,
					labels: config.ciliumPolicy.labels,
					annotations: config.ciliumPolicy.annotations,
				});
			}

			if (config.istioMesh.enabled) {
				defineIstioMesh({
					scope: self,
					id: "descheduler-istio-mesh",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					destinationRule: config.istioMesh.destinationRule,
					peerAuthentication: config.istioMesh.peerAuthentication,
					labels: config.istioMesh.labels,
					annotations: config.istioMesh.annotations,
				});
			}

			if (config.istioAuth.enabled) {
				defineIstioAuth({
					scope: self,
					id: "descheduler-istio-auth",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					jwtRules: [],
					authorizationPolicy: config.istioAuth.authorizationPolicy,
					labels: config.istioAuth.labels,
					annotations: config.istioAuth.annotations,
				});
			}

			if (config.secretProviderClass.enabled) {
				defineSecretProviderClass({
					scope: self,
					id: "secret-provider-class",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					vaultAddress: config.secretProviderClass.vaultAddress,
					vaultRole: config.secretProviderClass.vaultRole,
					pkiPath: config.secretProviderClass.pkiPath,
					secretName: config.secretProviderClass.secretName,
					dnsNames: config.secretProviderClass.dnsNames,
					ttl: config.secretProviderClass.ttl,
					labels: config.secretProviderClass.labels,
					annotations: config.secretProviderClass.annotations,
				});
			}

			if (!config.disableMetrics) {
				defineServiceMonitor({
					scope: self,
					id: "descheduler-servicemonitor",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					port: "metrics",
					interval: "30s",
					scheme: "HTTPS",
					metricRegex: "descheduler|scheduler_|process_|go_|otel",
				});
			}

			if (config.vpa.enabled) {
				defineVpa({
					scope: self,
					id: "descheduler-vpa",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					targetRef: {
						apiVersion: "apps/v1",
						kind: "Deployment",
						name: config.name,
					},
					updateMode: config.vpa.updateMode,
					controlledResources: config.vpa.controlledResources,
					controlledValues: config.vpa.controlledValues,
					containerPolicies: config.vpa.containerPolicies,
				});
			}

			if (config.hpa.enabled) {
				defineHpa({
					scope: self,
					id: "descheduler-hpa",
					name: config.name,
					namespace: config.namespace,
					version: config.version,
					scaleTargetRef: {
						apiVersion: "apps/v1",
						kind: "Deployment",
						name: config.name,
					},
					minReplicas: config.hpa.minReplicas,
					maxReplicas: config.hpa.maxReplicas,
					metrics: config.hpa.metrics,
					behavior: config.hpa.behavior,
				});
			}
		},
	});

export {
	DeschedulerChart,
	DeschedulerChartBuilder,
	KnownLatestDeschedulerVersion,
	LatestDeschedulerVersion,
};
