/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const CustodianStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof CustodianStackConfigSchema>;

export type CustodianStackProps = ChartProps & ConfigInput;

export class CustodianStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: CustodianStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const CustodianStackBuilder = createChartBuilder({
	chartCtor: CustodianStack,
	configSchema: CustodianStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
