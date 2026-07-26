/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ArgocdImagesChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ArgocdImagesChartConfigSchema>;

export type ArgocdImagesChartProps = ChartProps & ConfigInput;

export class ArgocdImagesChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ArgocdImagesChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ArgocdImagesChartBuilder = createChartBuilder({
	chartCtor: ArgocdImagesChart,
	configSchema: ArgocdImagesChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
