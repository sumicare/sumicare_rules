/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ExternalDNSChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ExternalDNSChartConfigSchema>;

export type ExternalDNSChartProps = ChartProps & ConfigInput;

export class ExternalDNSChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: ExternalDNSChartProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ExternalDNSChartBuilder = createChartBuilder({
	chartCtor: ExternalDNSChart,
	configSchema: ExternalDNSChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
