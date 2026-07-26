/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TektoncdResultsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TektoncdResultsChartConfigSchema>;

export type TektoncdResultsChartProps = ChartProps & ConfigInput;

export class TektoncdResultsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: TektoncdResultsChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TektoncdResultsChartBuilder = createChartBuilder({
	chartCtor: TektoncdResultsChart,
	configSchema: TektoncdResultsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
