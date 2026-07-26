/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const MLOpsStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof MLOpsStackConfigSchema>;

export type MLOpsStackProps = ChartProps & ConfigInput;

export class MLOpsStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: MLOpsStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const MLOpsStackBuilder = createChartBuilder({
	chartCtor: MLOpsStack,
	configSchema: MLOpsStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
