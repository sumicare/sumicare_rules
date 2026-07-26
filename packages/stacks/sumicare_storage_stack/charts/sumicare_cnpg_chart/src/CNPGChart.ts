/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const CNPGChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof CNPGChartConfigSchema>;

export type CNPGChartProps = ChartProps & ConfigInput;

export class CNPGChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: CNPGChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const CNPGChartBuilder = createChartBuilder({
	chartCtor: CNPGChart,
	configSchema: CNPGChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
