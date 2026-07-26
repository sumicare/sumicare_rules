/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const LocalPathProvisionerChartConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof LocalPathProvisionerChartConfigSchema>;

export type LocalPathProvisionerChartProps = ChartProps & ConfigInput;

export class LocalPathProvisionerChart extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: LocalPathProvisionerChartProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const LocalPathProvisionerChartBuilder = createChartBuilder({
	chartCtor: LocalPathProvisionerChart,
	configSchema: LocalPathProvisionerChartConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
