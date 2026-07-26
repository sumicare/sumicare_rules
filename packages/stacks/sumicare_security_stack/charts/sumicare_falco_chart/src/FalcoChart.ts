/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const FalcoChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof FalcoChartConfigSchema>;

export type FalcoChartProps = ChartProps & ConfigInput;

export class FalcoChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: FalcoChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const FalcoChartBuilder = createChartBuilder({
	chartCtor: FalcoChart,
	configSchema: FalcoChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
