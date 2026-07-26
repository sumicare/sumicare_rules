/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	VpaConfigError,
	VpaConfigSchema,
	vpaConfig,
} from "Compute/Vpa/Config";
import { VpaServiceMonitor } from "Compute/Vpa/CustomResources";
import {
	createVpaDeployment,
	createVpaRbac,
	VpaMutatingWebhook,
	VpaPodDisruptionBudget,
	VpaService,
} from "Compute/Vpa/Resources";
import { KnownLatestVpaVersion, LatestVpaVersion } from "Compute/Vpa/Version";

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof VpaConfigSchema>;

/** Props for {@link VpaChart}. Combines CDK8s {@link ChartProps} with VPA config options. */
export type VpaChartProps = ChartProps & ConfigInput & { env?: string };

/**
 * CDK8s chart that generates all Kubernetes resources for the Vertical Pod
 * Autoscaler: ServiceAccounts, ClusterRoles, ClusterRoleBindings, Deployments
 * (recommender, updater, admission controller), webhook Service,
 * MutatingWebhookConfiguration, and PodDisruptionBudgets.
 *
 * @example
 * ```typescript
 * const app = new App();
 * const chart = new VpaChart(app, "vpa");
 * ```
 */
export class VpaChart extends Chart {
	/** Parsed and validated VPA configuration. */
	readonly config: Config;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param id - The construct ID.
	 * @param props - VPA chart props (all optional, uses defaults from {@link VpaConfigSchema}).
	 * @throws {VpaConfigError} when config validation fails.
	 */
	constructor(scope: Construct, id: string, props: VpaChartProps = {}) {
		super(scope, id, props);

		const { env, ...configProps } = props;
		const result = VpaConfigSchema.safeParse(configProps);
		if (!result.success) {
			throw new VpaConfigError(id, result.error);
		}

		this.config = vpaConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		const rbac = createVpaRbac(this, this.config);

		createVpaDeployment(
			this,
			this.config,
			rbac.serviceAccounts.recommender,
			rbac.serviceAccounts.updater,
			rbac.serviceAccounts.admissionController,
		);

		const vpaService = new VpaService(this, this.config);

		if (this.config.admissionController.enabled) {
			new VpaMutatingWebhook(this, this.config);
		}

		new VpaPodDisruptionBudget(this, this.config, env ?? "dev");

		if (!this.config.disableMetrics) {
			new VpaServiceMonitor(this, this.config, vpaService);
		}
	}
}

/**
 * Fluent builder for {@link VpaChart}.
 *
 * @example
 * ```typescript
 * const chart = await VpaChartBuilder.create(app, "vpa")
 *   .set("recommender", { enabled: true, replicas: 3 })
 *   .build();
 * ```
 */
export const VpaChartBuilder = createChartBuilder({
	chartCtor: VpaChart,
	configSchema: VpaConfigSchema,
	latestVersion: LatestVpaVersion,
	resolveConfig: vpaConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestVpaVersion, LatestVpaVersion };
