/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartRookOperatorChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartRookOperatorChartConfigSchema>;

export type ChartRookOperatorChartProps = ChartProps & ConfigInput;

export class ChartRookOperatorChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartRookOperatorChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartRookOperatorChartBuilder = createChartBuilder({
	chartCtor: ChartRookOperatorChart,
	configSchema: chartRookOperatorChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
