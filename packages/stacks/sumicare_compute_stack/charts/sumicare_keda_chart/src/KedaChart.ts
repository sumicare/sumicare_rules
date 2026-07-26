/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	KedaConfigError,
	KedaConfigSchema,
	kedaConfig,
} from "Compute/Keda/Config";
import { KedaServiceMonitor } from "Compute/Keda/CustomResources";
import {
	createKedaDeployment,
	createKedaRbac,
	KedaApiService,
	KedaPodDisruptionBudget,
	KedaService,
	KedaValidatingWebhook,
} from "Compute/Keda/Resources";
import {
	KnownLatestKedaVersion,
	LatestKedaVersion,
} from "Compute/Keda/Version";

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KedaConfigSchema>;

/** Props for {@link KedaChart}. Combines CDK8s {@link ChartProps} with KEDA config options. */
export type KedaChartProps = ChartProps & ConfigInput & { env?: string };

/**
 * CDK8s chart that generates all Kubernetes resources for KEDA:
 * ServiceAccounts, ClusterRoles, ClusterRoleBindings, Deployments
 * (operator, metrics server, admission webhooks), Services,
 * ValidatingWebhookConfiguration, APIService, and
 * PodDisruptionBudgets.
 *
 * @example
 * ```typescript
 * const app = new App();
 * const chart = new KedaChart(app, "keda");
 * ```
 */
export class KedaChart extends Chart {
	/** Parsed and validated KEDA configuration. */
	readonly config: Config;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param id - The construct ID.
	 * @param props - KEDA chart props (all optional, uses defaults from {@link KedaConfigSchema}).
	 * @throws {KedaConfigError} when config validation fails.
	 */
	constructor(scope: Construct, id: string, props: KedaChartProps = {}) {
		super(scope, id, props);

		const { env, ...configProps } = props;
		const result = KedaConfigSchema.safeParse(configProps);
		if (!result.success) {
			throw new KedaConfigError(id, result.error);
		}

		this.config = kedaConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		const rbac = createKedaRbac(this, this.config);

		createKedaDeployment(
			this,
			this.config,
			rbac.serviceAccounts.operator,
			rbac.serviceAccounts.metricsServer,
			rbac.serviceAccounts.webhooks,
		);

		const kedaService = new KedaService(this, this.config);

		if (this.config.metricsServer.enabled) {
			new KedaApiService(this, this.config);
		}

		if (this.config.webhooks.enabled) {
			new KedaValidatingWebhook(this, this.config);
		}

		new KedaPodDisruptionBudget(this, this.config, env ?? "dev");

		if (!this.config.disableMetrics) {
			new KedaServiceMonitor(this, this.config, kedaService);
		}
	}
}

/**
 * Fluent builder for {@link KedaChart}.
 *
 * @example
 * ```typescript
 * const chart = await KedaChartBuilder.create(app, "keda")
 *   .set("operator", { replicas: 2 })
 *   .build();
 * ```
 */
export const KedaChartBuilder = createChartBuilder({
	chartCtor: KedaChart,
	configSchema: KedaConfigSchema,
	latestVersion: LatestKedaVersion,
	resolveConfig: kedaConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKedaVersion, LatestKedaVersion };
