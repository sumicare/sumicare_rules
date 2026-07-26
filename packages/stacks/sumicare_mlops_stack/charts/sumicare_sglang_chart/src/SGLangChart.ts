/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const SGLangChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof SGLangChartConfigSchema>;

export type SGLangChartProps = ChartProps & ConfigInput;

export class SGLangChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: SGLangChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const SGLangChartBuilder = createChartBuilder({
	chartCtor: SGLangChart,
	configSchema: SGLangChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
