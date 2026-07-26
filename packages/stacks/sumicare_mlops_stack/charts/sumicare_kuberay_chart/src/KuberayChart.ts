/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const KuberayChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof KuberayChartConfigSchema>;

export type KuberayChartProps = ChartProps & ConfigInput;

export class KuberayChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: KuberayChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const KuberayChartBuilder = createChartBuilder({
	chartCtor: KuberayChart,
	configSchema: KuberayChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
