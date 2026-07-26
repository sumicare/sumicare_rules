/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TektoncdDashboardChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TektoncdDashboardChartConfigSchema>;

export type TektoncdDashboardChartProps = ChartProps & ConfigInput;

export class TektoncdDashboardChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: TektoncdDashboardChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TektoncdDashboardChartBuilder = createChartBuilder({
	chartCtor: TektoncdDashboardChart,
	configSchema: TektoncdDashboardChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
