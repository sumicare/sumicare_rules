/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const KubearmorChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof KubearmorChartConfigSchema>;

export type KubearmorChartProps = ChartProps & ConfigInput;

export class KubearmorChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: KubearmorChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const KubearmorChartBuilder = createChartBuilder({
	chartCtor: KubearmorChart,
	configSchema: KubearmorChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
