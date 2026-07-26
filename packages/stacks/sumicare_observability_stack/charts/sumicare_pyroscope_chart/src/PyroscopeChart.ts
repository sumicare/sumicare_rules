/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const PyroscopeChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof PyroscopeChartConfigSchema>;

export type PyroscopeChartProps = ChartProps & ConfigInput;

export class PyroscopeChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: PyroscopeChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const PyroscopeChartBuilder = createChartBuilder({
	chartCtor: PyroscopeChart,
	configSchema: PyroscopeChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
