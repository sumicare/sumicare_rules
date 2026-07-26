/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const KyvernoChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof KyvernoChartConfigSchema>;

export type KyvernoChartProps = ChartProps & ConfigInput;

export class KyvernoChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: KyvernoChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const KyvernoChartBuilder = createChartBuilder({
	chartCtor: KyvernoChart,
	configSchema: KyvernoChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
