/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const OpencostStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof OpencostStackConfigSchema>;

export type OpencostStackProps = ChartProps & ConfigInput;

export class OpencostStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: OpencostStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const OpencostStackBuilder = createChartBuilder({
	chartCtor: OpencostStack,
	configSchema: OpencostStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
