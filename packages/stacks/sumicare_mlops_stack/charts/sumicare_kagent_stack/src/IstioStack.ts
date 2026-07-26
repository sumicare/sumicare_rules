/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const IstioStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof IstioStackConfigSchema>;

export type IstioStackProps = ChartProps & ConfigInput;

export class IstioStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: IstioStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const IstioStackBuilder = createChartBuilder({
	chartCtor: IstioStack,
	configSchema: IstioStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
