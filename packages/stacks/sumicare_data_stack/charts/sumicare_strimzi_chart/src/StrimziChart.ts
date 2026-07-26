/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const StrimziChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof StrimziChartConfigSchema>;

export type StrimziChartProps = ChartProps & ConfigInput;

export class StrimziChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: StrimziChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const StrimziChartBuilder = createChartBuilder({
	chartCtor: StrimziChart,
	configSchema: StrimziChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
