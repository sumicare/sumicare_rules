/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const DevelopmentStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof DevelopmentStackConfigSchema>;

export type DevelopmentStackProps = ChartProps & ConfigInput;

export class DevelopmentStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: DevelopmentStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const DevelopmentStackBuilder = createChartBuilder({
	chartCtor: DevelopmentStack,
	configSchema: DevelopmentStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
