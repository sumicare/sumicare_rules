/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ValkeyOperatorChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ValkeyOperatorChartConfigSchema>;

export type ValkeyOperatorChartProps = ChartProps & ConfigInput;

export class ValkeyOperatorChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ValkeyOperatorChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ValkeyOperatorChartBuilder = createChartBuilder({
	chartCtor: ValkeyOperatorChart,
	configSchema: ValkeyOperatorChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
