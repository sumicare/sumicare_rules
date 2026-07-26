/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const NetbirdStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof NetbirdStackConfigSchema>;

export type NetbirdStackProps = ChartProps & ConfigInput;

export class NetbirdStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: NetbirdStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const NetbirdStackBuilder = createChartBuilder({
	chartCtor: NetbirdStack,
	configSchema: NetbirdStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
