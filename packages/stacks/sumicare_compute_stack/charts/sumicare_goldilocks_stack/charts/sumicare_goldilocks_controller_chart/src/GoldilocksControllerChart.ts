/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	GoldilocksControllerConfigError,
	GoldilocksControllerConfigSchema,
	goldilocksControllerConfig,
} from "Goldilocks/Controller/Config";
import {
	createGoldilocksControllerDeployment,
	createGoldilocksControllerRbac,
	GoldilocksControllerService,
} from "Goldilocks/Controller/Resources";
import {
	KnownLatestGoldilocksVersion,
	LatestGoldilocksVersion,
} from "Goldilocks/Controller/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import {
	defineHpa,
	defineServiceMonitor,
	defineVpa,
} from "@sumicare/chart-commons/crds";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof GoldilocksControllerConfigSchema>;

/** Props for {@link GoldilocksControllerChart}. */
export type GoldilocksControllerChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates all Kubernetes resources for the Goldilocks
 * controller: ServiceAccount, ClusterRole, ClusterRoleBinding, Deployment,
 * metrics Service, and ServiceMonitor.
 *
 * @example
 * ```typescript
 * const app = new App();
 * const chart = new GoldilocksControllerChart(app, "controller");
 * ```
 */
export class GoldilocksControllerChart extends Chart {
	readonly config: Config;

	constructor(
		scope: Construct,
		id: string,
		props: GoldilocksControllerChartProps = {},
	) {
		super(scope, id, props);

		const result = GoldilocksControllerConfigSchema.safeParse(props);
		if (!result.success) {
			throw new GoldilocksControllerConfigError(id, result.error);
		}
		this.config = goldilocksControllerConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		const rbac = createGoldilocksControllerRbac(this, this.config);
		createGoldilocksControllerDeployment(
			this,
			this.config,
			rbac.serviceAccounts.controller,
		);
		new GoldilocksControllerService(this, this.config);

		if (!this.config.disableMetrics) {
			defineServiceMonitor({
				scope: this,
				id: "controller-servicemonitor",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "controller",
				port: "metrics",
				interval: "30s",
				scheme: "HTTP",
				metricRegex: "goldilocks_(build_info|controller_)",
			});
		}

		if (this.config.vpa.enabled) {
			defineVpa({
				scope: this,
				id: "controller-vpa",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "controller",
				targetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: `${this.config.name}-controller`,
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
				id: "controller-hpa",
				name: this.config.name,
				namespace: this.config.namespace,
				version: this.config.version,
				component: "controller",
				scaleTargetRef: {
					apiVersion: "apps/v1",
					kind: "Deployment",
					name: `${this.config.name}-controller`,
				},
				minReplicas: this.config.hpa.minReplicas,
				maxReplicas: this.config.hpa.maxReplicas,
				metrics: this.config.hpa.metrics,
				behavior: this.config.hpa.behavior,
			});
		}
	}
}

/**
 * Fluent builder for {@link GoldilocksControllerChart}.
 *
 * @example
 * ```typescript
 * const chart = await GoldilocksControllerChartBuilder.create(app, "controller")
 *   .set("namespace", "goldilocks")
 *   .build();
 * ```
 */
export const GoldilocksControllerChartBuilder = createChartBuilder({
	chartCtor: GoldilocksControllerChart,
	configSchema: GoldilocksControllerConfigSchema,
	latestVersion: LatestGoldilocksVersion,
	resolveConfig: goldilocksControllerConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestGoldilocksVersion, LatestGoldilocksVersion };
