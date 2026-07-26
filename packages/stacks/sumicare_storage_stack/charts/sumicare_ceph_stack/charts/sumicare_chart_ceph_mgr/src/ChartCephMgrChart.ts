/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const chartCephMgrChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof chartCephMgrChartConfigSchema>;

export type ChartCephMgrChartProps = ChartProps & ConfigInput;

export class ChartCephMgrChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ChartCephMgrChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ChartCephMgrChartBuilder = createChartBuilder({
	chartCtor: ChartCephMgrChart,
	configSchema: chartCephMgrChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
