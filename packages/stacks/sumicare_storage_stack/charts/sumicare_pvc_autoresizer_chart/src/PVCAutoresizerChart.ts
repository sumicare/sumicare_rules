/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const PVCAutoresizerChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof PVCAutoresizerChartConfigSchema>;

export type PVCAutoresizerChartProps = ChartProps & ConfigInput;

export class PVCAutoresizerChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: PVCAutoresizerChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const PVCAutoresizerChartBuilder = createChartBuilder({
	chartCtor: PVCAutoresizerChart,
	configSchema: PVCAutoresizerChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
