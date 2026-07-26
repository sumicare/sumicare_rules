/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	KamajiControllerConfigError,
	KamajiControllerConfigSchema,
	kamajiControllerConfig,
} from "Kamaji/Controller/Config";
import {
	KamajiSecretProviderClass,
	KamajiServiceMonitor,
} from "Kamaji/Controller/CustomResources";
import {
	createKamajiDeployment,
	createKamajiRbac,
	KamajiPodDisruptionBudget,
	KamajiService,
	KamajiWebhook,
} from "Kamaji/Controller/Resources";
import {
	KnownLatestKamajiVersion,
	LatestKamajiVersion,
} from "Kamaji/Controller/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiControllerConfigSchema>;

export type KamajiControllerChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates all Kubernetes resources for the Kamaji
 * controller: ServiceAccounts, ClusterRoles, ClusterRoleBindings,
 * Deployment, Services (webhook + metrics), SecretProviderClass for
 * TLS certs via OpenBao CSI, Mutating/Validating WebhookConfigurations,
 * and optionally a ServiceMonitor and PodDisruptionBudget.
 */
export class KamajiControllerChart extends Chart {
	readonly config: Config;

	constructor(
		scope: Construct,
		id: string,
		props: KamajiControllerChartProps = {},
	) {
		super(scope, id, props);

		const result = KamajiControllerConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiControllerConfigError(id, result.error);
		}
		this.config = kamajiControllerConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		const rbac = createKamajiRbac(this, this.config);
		const spc = new KamajiSecretProviderClass(this, this.config);
		createKamajiDeployment(
			this,
			this.config,
			rbac.serviceAccounts.kamaji,
			spc.secretName,
		);
		new KamajiService(this, this.config);
		new KamajiWebhook(this, this.config);

		if (this.config.serviceMonitor.enabled) {
			new KamajiServiceMonitor(this, this.config);
		}

		const env = (props as Record<string, unknown>).env as string | undefined;
		if (env) {
			new KamajiPodDisruptionBudget(this, this.config, env);
		}
	}
}

export const KamajiControllerChartBuilder = createChartBuilder({
	chartCtor: KamajiControllerChart,
	configSchema: KamajiControllerConfigSchema,
	latestVersion: LatestKamajiVersion,
	resolveConfig: kamajiControllerConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKamajiVersion, LatestKamajiVersion };
