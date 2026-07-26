/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const TektoncdStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof TektoncdStackConfigSchema>;

export type TektoncdStackProps = ChartProps & ConfigInput;

export class TektoncdStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: TektoncdStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const TektoncdStackBuilder = createChartBuilder({
	chartCtor: TektoncdStack,
	configSchema: TektoncdStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
