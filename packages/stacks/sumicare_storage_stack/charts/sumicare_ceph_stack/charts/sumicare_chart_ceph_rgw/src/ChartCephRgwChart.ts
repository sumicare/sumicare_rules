/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartCephRgwChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartCephRgwChartConfigSchema>;

export type ChartCephRgwChartProps = ChartProps & ConfigInput;

export class ChartCephRgwChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartCephRgwChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartCephRgwChartBuilder = createChartBuilder({
	chartCtor: ChartCephRgwChart,
	configSchema: chartCephRgwChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
