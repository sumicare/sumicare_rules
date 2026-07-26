/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const KiteChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof KiteChartConfigSchema>;

export type KiteChartProps = ChartProps & ConfigInput;

export class KiteChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: KiteChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const KiteChartBuilder = createChartBuilder({
	chartCtor: KiteChart,
	configSchema: KiteChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
