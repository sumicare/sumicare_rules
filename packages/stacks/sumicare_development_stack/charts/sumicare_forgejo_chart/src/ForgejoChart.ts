/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ForgejoChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ForgejoChartConfigSchema>;

export type ForgejoChartProps = ChartProps & ConfigInput;

export class ForgejoChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: ForgejoChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ForgejoChartBuilder = createChartBuilder({
	chartCtor: ForgejoChart,
	configSchema: ForgejoChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
