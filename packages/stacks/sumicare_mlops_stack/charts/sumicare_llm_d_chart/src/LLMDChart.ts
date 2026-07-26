/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const LLMDChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof LLMDChartConfigSchema>;

export type LLMDChartProps = ChartProps & ConfigInput;

export class LLMDChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: LLMDChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const LLMDChartBuilder = createChartBuilder({
	chartCtor: LLMDChart,
	configSchema: LLMDChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
