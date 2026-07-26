/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartCephOsdChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartCephOsdChartConfigSchema>;

export type ChartCephOsdChartProps = ChartProps & ConfigInput;

export class ChartCephOsdChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartCephOsdChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartCephOsdChartBuilder = createChartBuilder({
	chartCtor: ChartCephOsdChart,
	configSchema: chartCephOsdChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
