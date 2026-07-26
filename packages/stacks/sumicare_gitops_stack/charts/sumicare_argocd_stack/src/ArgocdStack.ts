/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const ArgocdStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof ArgocdStackConfigSchema>;

export type ArgocdStackProps = ChartProps & ConfigInput;

export class ArgocdStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: ArgocdStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const ArgocdStackBuilder = createChartBuilder({
	chartCtor: ArgocdStack,
	configSchema: ArgocdStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
