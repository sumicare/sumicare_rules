/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const VolcanoChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof VolcanoChartConfigSchema>;

export type VolcanoChartProps = ChartProps & ConfigInput;

export class VolcanoChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: VolcanoChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const VolcanoChartBuilder = createChartBuilder({
	chartCtor: VolcanoChart,
	configSchema: VolcanoChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
