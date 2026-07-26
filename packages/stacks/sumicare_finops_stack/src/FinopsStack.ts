/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const FinopsStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof FinopsStackConfigSchema>;

export type FinopsStackProps = ChartProps & ConfigInput;

export class FinopsStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: FinopsStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const FinopsStackBuilder = createChartBuilder({
	chartCtor: FinopsStack,
	configSchema: FinopsStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
