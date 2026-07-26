/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const NetworkingStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof NetworkingStackConfigSchema>;

export type NetworkingStackProps = ChartProps & ConfigInput;

export class NetworkingStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: NetworkingStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const NetworkingStackBuilder = createChartBuilder({
	chartCtor: NetworkingStack,
	configSchema: NetworkingStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
