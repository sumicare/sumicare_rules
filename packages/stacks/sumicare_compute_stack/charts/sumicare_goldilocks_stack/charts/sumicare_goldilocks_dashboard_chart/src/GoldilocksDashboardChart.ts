/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	GoldilocksDashboardConfigError,
	GoldilocksDashboardConfigSchema,
	goldilocksDashboardConfig,
} from "Goldilocks/Dashboard/Config";
import {
	createGoldilocksDashboardDeployment,
	createGoldilocksDashboardRbac,
	GoldilocksDashboardService,
} from "Goldilocks/Dashboard/Resources";
import {
	KnownLatestGoldilocksVersion,
	LatestGoldilocksVersion,
} from "Goldilocks/Dashboard/Version";
import { commonLabels, createChartBuilder } from "@sumicare/chart-commons";
import {
	defineCiliumPolicy,
	defineDexAuth,
	defineGateway,
	defineHpa,
	defineHttpRoute,
	defineIngress,
	defineIstioAuth,
	defineIstioMesh,
	defineNetbird,
	defineSecretProviderClass,
	defineServiceMonitor,
	defineVpa,
} from "@sumicare/chart-commons/crds";
import { ApiObject, Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof GoldilocksDashboardConfigSchema>;

/** Props for {@link GoldilocksDashboardChart}. */
export type GoldilocksDashboardChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates all Kubernetes resources for the Goldilocks
 * dashboard: ServiceAccount, ClusterRole, ClusterRoleBinding, Deployment,
 * Service, ServiceMonitor, and optionally Ingress / HTTPRoute / Gateway /
 * Istio mesh / SecretProviderClass for TLS via OpenBao CSI / Dex OIDC /
 * Istio JWT auth / Cilium NetworkPolicy / Netbird NetworkResource.
 *
 * @example
 * ```typescript
 * const app = new App();
 * const chart = new GoldilocksDashboardChart(app, "dashboard");
 * ```
 */
export class GoldilocksDashboardChart extends Chart {
	readonly config: Config;

	constructor(
		scope: Construct,
		id: string,
		props: GoldilocksDashboardChartProps = {},
	) {
		super(scope, id, props);

		const result = GoldilocksDashboardConfigSchema.safeParse(props);
		if (!result.success) {
			throw new GoldilocksDashboardConfigError(id, result.error);
		}
		this.config = goldilocksDashboardConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		const rbac = createGoldilocksDashboardRbac(this, this.config);
		createGoldilocksDashboardDeployment(
			this,
			this.config,
			rbac.serviceAccounts.dashboard,
		);
		const svc = new GoldilocksDashboardService(this, this.config);

		if (this.config.ingress.enabled) {
			defineIngress({
				scope: this,
				id: "dashboard-ingress",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				ingressClassName: this.config.ingress.ingressClassName,
				hosts: this.config.ingress.hosts,
				tls: this.config.ingress.tls,
				backendServiceName: `${this.config.name}-dashboard`,
				backendServicePort: "http",
				annotations: this.config.ingress.annotations,
			});
		}

		if (this.config.httpRoute.enabled) {
			defineHttpRoute({
				scope: this,
				id: "dashboard-httproute",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				parentRefs: this.config.httpRoute.parentRefs,
				hostnames: this.config.httpRoute.hostnames,
				matches: this.config.httpRoute.matches,
				backendRefs: [
					{
						name: `${this.config.name}-dashboard`,
						port: this.config.service.port,
					},
				],
				labels: this.config.httpRoute.labels,
				annotations: this.config.httpRoute.annotations,
			});
		}

		if (
			this.config.httpRoute.enabled &&
			this.config.healthCheckPolicy.enabled &&
			svc.service
		) {
			this.createHealthCheckPolicy();
		}

		if (this.config.gateway.enabled) {
			defineGateway({
				scope: this,
				id: "dashboard-gateway",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				gatewayClassName: this.config.gateway.gatewayClassName,
				listeners: this.config.gateway.listeners,
				labels: this.config.gateway.labels,
				annotations: this.config.gateway.annotations,
			});
		}

		if (this.config.istioMesh.enabled) {
			defineIstioMesh({
				scope: this,
				id: "dashboard-istio-mesh",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				destinationRule: this.config.istioMesh.destinationRule,
				peerAuthentication: this.config.istioMesh.peerAuthentication,
				labels: this.config.istioMesh.labels,
				annotations: this.config.istioMesh.annotations,
			});
		}

		if (this.config.netbird.enabled) {
			defineNetbird({
				scope: this,
				id: "dashboard-netbird",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				networkRouterRef: this.config.netbird.networkRouterRef,
				serviceRef: `${this.config.name}-dashboard`,
				groups: this.config.netbird.groups,
				labels: this.config.netbird.labels,
				annotations: this.config.netbird.annotations,
			});
		}

		if (this.config.secretProviderClass.enabled) {
			defineSecretProviderClass({
				scope: this,
				id: "secret-provider-class",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				vaultAddress: this.config.secretProviderClass.vaultAddress,
				vaultRole: this.config.secretProviderClass.vaultRole,
				pkiPath: this.config.secretProviderClass.pkiPath,
				secretName: this.config.secretProviderClass.secretName,
				dnsNames: this.config.secretProviderClass.dnsNames,
				ttl: this.config.secretProviderClass.ttl,
				labels: this.config.secretProviderClass.labels,
				annotations: this.config.secretProviderClass.annotations,
			});
		}

		if (this.config.dexAuth.enabled) {
			defineDexAuth({
				scope: this,
				id: "dashboard-dex-auth",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				extensionName: this.config.dexAuth.extensionName,
				issuerUri: this.config.dexAuth.issuerUri,
				clientId: this.config.dexAuth.clientId,
				clientSecretRef: this.config.dexAuth.clientSecretRef,
				scopes: this.config.dexAuth.scopes,
				redirectUri: this.config.dexAuth.redirectUri,
				logoutPath: this.config.dexAuth.logoutPath,
				dexBackendRef: this.config.dexAuth.dexBackendRef,
				labels: this.config.dexAuth.labels,
				annotations: this.config.dexAuth.annotations,
			});
		}

		if (this.config.istioAuth.enabled) {
			defineIstioAuth({
				scope: this,
				id: "dashboard-istio-auth",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				jwtRules: this.config.istioAuth.jwtRules,
				authorizationPolicy: this.config.istioAuth.authorizationPolicy,
				labels: this.config.istioAuth.labels,
				annotations: this.config.istioAuth.annotations,
			});
		}

		if (this.config.ciliumPolicy.enabled) {
			defineCiliumPolicy({
				scope: this,
				id: "dashboard-cilium-policy",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				enableDefaultDeny: this.config.ciliumPolicy.enableDefaultDeny,
				ingress: this.config.ciliumPolicy.ingress,
				egress: this.config.ciliumPolicy.egress,
				labels: this.config.ciliumPolicy.labels,
				annotations: this.config.ciliumPolicy.annotations,
			});
		}

		if (!this.config.disableMetrics) {
			defineServiceMonitor({
				scope: this,
				id: "dashboard-servicemonitor",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				port: "http",
				interval: "30s",
				scheme: "HTTP",
				metricRegex: "goldilocks|python|process|otel",
			});
		}

		if (this.config.vpa.enabled) {
			defineVpa({
				scope: this,
				id: "dashboard-vpa",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				targetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: `${this.config.name}-dashboard`,
				},
				updateMode: this.config.vpa.updateMode,
				controlledResources: this.config.vpa.controlledResources,
				controlledValues: this.config.vpa.controlledValues,
				containerPolicies: this.config.vpa.containerPolicies,
			});
		}

		if (this.config.hpa.enabled) {
			defineHpa({
				scope: this,
				id: "dashboard-hpa",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "dashboard",
				scaleTargetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: `${this.config.name}-dashboard`,
				},
				minReplicas: this.config.hpa.minReplicas,
				maxReplicas: this.config.hpa.maxReplicas,
				metrics: this.config.hpa.metrics,
				behavior: this.config.hpa.behavior,
			});
		}
	}

	private createHealthCheckPolicy(): void {
		const dc = this.config;
		const labels = {
			...commonLabels(this.config),
			"app.kubernetes.io/component": "dashboard",
		};

		const spec: Record<string, unknown> = {
			default: {
				config: {
					type: "HTTP",
					httpHealthCheck: {
						requestPath: dc.healthCheckPolicy.requestPath,
					},
				},
			},
			targetRef: {
				group: "",
				kind: "Service",
				name: `${this.config.name}-dashboard`,
			},
		};

		new ApiObject(this, "dashboard-healthcheckpolicy", {
			apiVersion: "networking.gke.io/v1",
			kind: "HealthCheckPolicy",
			metadata: {
				name: `${this.config.name}-dashboard`,
				namespace: this.config.namespace,
				labels,
			},
			spec,
		});
	}
}

/**
 * Fluent builder for {@link GoldilocksDashboardChart}.
 *
 * @example
 * ```typescript
 * const chart = await GoldilocksDashboardChartBuilder.create(app, "dashboard")
 *   .set("namespace", "goldilocks")
 *   .build();
 * ```
 */
export const GoldilocksDashboardChartBuilder = createChartBuilder({
	chartCtor: GoldilocksDashboardChart,
	configSchema: GoldilocksDashboardConfigSchema,
	latestVersion: LatestGoldilocksVersion,
	resolveConfig: goldilocksDashboardConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestGoldilocksVersion, LatestGoldilocksVersion };
