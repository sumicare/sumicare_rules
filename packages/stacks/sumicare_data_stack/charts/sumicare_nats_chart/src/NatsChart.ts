/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const NatsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof NatsChartConfigSchema>;

export type NatsChartProps = ChartProps & ConfigInput;

export class NatsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: NatsChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const NatsChartBuilder = createChartBuilder({
	chartCtor: NatsChart,
	configSchema: NatsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
