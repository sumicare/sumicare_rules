/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const MimirChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof MimirChartConfigSchema>;

export type MimirChartProps = ChartProps & ConfigInput;

export class MimirChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: MimirChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const MimirChartBuilder = createChartBuilder({
	chartCtor: MimirChart,
	configSchema: MimirChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
