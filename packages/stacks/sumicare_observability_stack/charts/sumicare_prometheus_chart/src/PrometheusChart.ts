/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const PrometheusChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof PrometheusChartConfigSchema>;

export type PrometheusChartProps = ChartProps & ConfigInput;

export class PrometheusChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: PrometheusChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const PrometheusChartBuilder = createChartBuilder({
	chartCtor: PrometheusChart,
	configSchema: PrometheusChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
