/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const GrafanaMCPChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof GrafanaMCPChartConfigSchema>;

export type GrafanaMCPChartProps = ChartProps & ConfigInput;

export class GrafanaMCPChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: GrafanaMCPChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const GrafanaMCPChartBuilder = createChartBuilder({
	chartCtor: GrafanaMCPChart,
	configSchema: GrafanaMCPChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
