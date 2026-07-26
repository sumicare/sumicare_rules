/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TheiaOperatorChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TheiaOperatorChartConfigSchema>;

export type TheiaOperatorChartProps = ChartProps & ConfigInput;

export class TheiaOperatorChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: TheiaOperatorChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TheiaOperatorChartBuilder = createChartBuilder({
	chartCtor: TheiaOperatorChart,
	configSchema: TheiaOperatorChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
