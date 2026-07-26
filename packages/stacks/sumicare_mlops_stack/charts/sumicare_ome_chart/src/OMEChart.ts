/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const OMEChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof OMEChartConfigSchema>;

export type OMEChartProps = ChartProps & ConfigInput;

export class OMEChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: OMEChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const OMEChartBuilder = createChartBuilder({
	chartCtor: OMEChart,
	configSchema: OMEChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
