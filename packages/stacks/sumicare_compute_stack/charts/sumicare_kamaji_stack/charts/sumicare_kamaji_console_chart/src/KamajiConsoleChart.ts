/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	KamajiConsoleConfigError,
	KamajiConsoleConfigSchema,
	kamajiConsoleConfig,
} from "Kamaji/Console/Config";
import {
	ConsoleIngress,
	ConsoleSecret,
	ConsoleService,
	createConsoleDeployment,
	createConsoleRbac,
} from "Kamaji/Console/Resources";
import {
	KnownLatestKamajiConsoleVersion,
	LatestKamajiConsoleVersion,
} from "Kamaji/Console/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiConsoleConfigSchema>;

export type KamajiConsoleChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates all Kubernetes resources for the Kamaji Console:
 * ServiceAccount, ClusterRole, ClusterRoleBinding, credentials Secret,
 * Deployment, Service, and optional Ingress.
 */
export class KamajiConsoleChart extends Chart {
	readonly config: Config;

	constructor(
		scope: Construct,
		id: string,
		props: KamajiConsoleChartProps = {},
	) {
		super(scope, id, props);

		const result = KamajiConsoleConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiConsoleConfigError(id, result.error);
		}
		this.config = result.data;

		const rbac = createConsoleRbac(this, this.config);
		new ConsoleSecret(this, this.config);
		const svc = new ConsoleService(this, this.config);
		createConsoleDeployment(this, this.config, rbac.serviceAccounts.console);
		new ConsoleIngress(this, this.config, svc.service.name);
	}
}

export const KamajiConsoleChartBuilder = createChartBuilder({
	chartCtor: KamajiConsoleChart,
	configSchema: KamajiConsoleConfigSchema,
	latestVersion: LatestKamajiConsoleVersion,
	resolveConfig: kamajiConsoleConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKamajiConsoleVersion, LatestKamajiConsoleVersion };
