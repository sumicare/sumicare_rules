/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const rookStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof rookStackConfigSchema>;

export type RookStackProps = ChartProps & ConfigInput;

export class RookStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: RookStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const RookStackBuilder = createChartBuilder({
	chartCtor: RookStack,
	configSchema: rookStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
