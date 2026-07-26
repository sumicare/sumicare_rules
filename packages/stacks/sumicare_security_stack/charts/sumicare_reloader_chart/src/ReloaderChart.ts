/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ReloaderChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ReloaderChartConfigSchema>;

export type ReloaderChartProps = ChartProps & ConfigInput;

export class ReloaderChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: ReloaderChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ReloaderChartBuilder = createChartBuilder({
	chartCtor: ReloaderChart,
	configSchema: ReloaderChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
