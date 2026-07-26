/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ArgoRolloutsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ArgoRolloutsChartConfigSchema>;

export type ArgoRolloutsChartProps = ChartProps & ConfigInput;

export class ArgoRolloutsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ArgoRolloutsChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ArgoRolloutsChartBuilder = createChartBuilder({
	chartCtor: ArgoRolloutsChart,
	configSchema: ArgoRolloutsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
