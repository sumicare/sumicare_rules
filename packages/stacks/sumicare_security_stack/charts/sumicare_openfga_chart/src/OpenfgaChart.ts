/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const OpenfgaChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof OpenfgaChartConfigSchema>;

export type OpenfgaChartProps = ChartProps & ConfigInput;

export class OpenfgaChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: OpenfgaChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const OpenfgaChartBuilder = createChartBuilder({
	chartCtor: OpenfgaChart,
	configSchema: OpenfgaChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
