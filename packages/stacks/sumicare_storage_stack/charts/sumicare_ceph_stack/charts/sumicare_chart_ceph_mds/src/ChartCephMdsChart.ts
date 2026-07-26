/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartCephMdsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartCephMdsChartConfigSchema>;

export type ChartCephMdsChartProps = ChartProps & ConfigInput;

export class ChartCephMdsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartCephMdsChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartCephMdsChartBuilder = createChartBuilder({
	chartCtor: ChartCephMdsChart,
	configSchema: chartCephMdsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
