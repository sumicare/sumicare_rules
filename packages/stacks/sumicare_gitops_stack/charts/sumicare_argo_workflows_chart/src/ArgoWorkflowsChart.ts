/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ArgoWorkflowsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ArgoWorkflowsChartConfigSchema>;

export type ArgoWorkflowsChartProps = ChartProps & ConfigInput;

export class ArgoWorkflowsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ArgoWorkflowsChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ArgoWorkflowsChartBuilder = createChartBuilder({
	chartCtor: ArgoWorkflowsChart,
	configSchema: ArgoWorkflowsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
