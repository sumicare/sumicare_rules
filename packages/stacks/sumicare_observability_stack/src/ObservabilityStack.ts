/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ObservabilityStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ObservabilityStackConfigSchema>;

export type ObservabilityStackProps = ChartProps & ConfigInput;

export class ObservabilityStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(
		scope: Construct,
		id: string,
		props: ObservabilityStackProps = {},
	) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ObservabilityStackBuilder = createChartBuilder({
	chartCtor: ObservabilityStack,
	configSchema: ObservabilityStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
