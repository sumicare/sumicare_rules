/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TheiaCloudChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TheiaCloudChartConfigSchema>;

export type TheiaCloudChartProps = ChartProps & ConfigInput;

export class TheiaCloudChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: TheiaCloudChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TheiaCloudChartBuilder = createChartBuilder({
	chartCtor: TheiaCloudChart,
	configSchema: TheiaCloudChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
