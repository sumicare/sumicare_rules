/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartRookClusterChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartRookClusterChartConfigSchema>;

export type ChartRookClusterChartProps = ChartProps & ConfigInput;

export class ChartRookClusterChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartRookClusterChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartRookClusterChartBuilder = createChartBuilder({
	chartCtor: ChartRookClusterChart,
	configSchema: chartRookClusterChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
