/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	KamajiKubeconfigGeneratorConfigError,
	KamajiKubeconfigGeneratorConfigSchema,
	kamajiKubeconfigGeneratorConfig,
} from "Kamaji/KubeconfigGenerator/Config";
import { createKamajiKubeconfigGeneratorDeployment } from "Kamaji/KubeconfigGenerator/Resources";
import {
	KnownLatestKamajiVersion,
	LatestKamajiVersion,
} from "Kamaji/KubeconfigGenerator/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiKubeconfigGeneratorConfigSchema>;

export type KamajiKubeconfigGeneratorChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates the Kamaji Kubeconfig Generator Deployment.
 *
 * The Kubeconfig Generator is an optional component that generates
 * kubeconfig files for Tenant Control Plane access. It reuses the
 * Kamaji controller image with the `kubeconfig-generator` subcommand.
 */
export class KamajiKubeconfigGeneratorChart extends Chart {
	readonly config: Config;

	constructor(
		scope: Construct,
		id: string,
		props: KamajiKubeconfigGeneratorChartProps = {},
	) {
		super(scope, id, props);

		const result = KamajiKubeconfigGeneratorConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiKubeconfigGeneratorConfigError(id, result.error);
		}
		this.config = kamajiKubeconfigGeneratorConfig.resolveConfig!(
			result.data as Record<string, unknown>,
		) as Config;

		createKamajiKubeconfigGeneratorDeployment(this, this.config);
	}
}

export const KamajiKubeconfigGeneratorChartBuilder = createChartBuilder({
	chartCtor: KamajiKubeconfigGeneratorChart,
	configSchema: KamajiKubeconfigGeneratorConfigSchema,
	latestVersion: LatestKamajiVersion,
	resolveConfig: kamajiKubeconfigGeneratorConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKamajiVersion, LatestKamajiVersion };
