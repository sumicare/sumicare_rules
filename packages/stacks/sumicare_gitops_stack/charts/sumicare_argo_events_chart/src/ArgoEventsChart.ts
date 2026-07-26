/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ArgoEventsChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ArgoEventsChartConfigSchema>;

export type ArgoEventsChartProps = ChartProps & ConfigInput;

export class ArgoEventsChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: ArgoEventsChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ArgoEventsChartBuilder = createChartBuilder({
	chartCtor: ArgoEventsChart,
	configSchema: ArgoEventsChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
