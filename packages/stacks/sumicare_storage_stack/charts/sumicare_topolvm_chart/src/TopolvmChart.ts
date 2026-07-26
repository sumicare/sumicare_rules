/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TopolvmChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TopolvmChartConfigSchema>;

export type TopolvmChartProps = ChartProps & ConfigInput;

export class TopolvmChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: TopolvmChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TopolvmChartBuilder = createChartBuilder({
	chartCtor: TopolvmChart,
	configSchema: TopolvmChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
