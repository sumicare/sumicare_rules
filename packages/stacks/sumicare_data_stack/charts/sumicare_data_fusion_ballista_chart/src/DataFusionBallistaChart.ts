/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const DataFusionBallistaChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof DataFusionBallistaChartConfigSchema>;

export type DataFusionBallistaChartProps = ChartProps & ConfigInput;

export class DataFusionBallistaChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: DataFusionBallistaChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const DataFusionBallistaChartBuilder = createChartBuilder({
	chartCtor: DataFusionBallistaChart,
	configSchema: DataFusionBallistaChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
