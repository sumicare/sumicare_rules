/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const KamajiStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof KamajiStackConfigSchema>;

export type KamajiStackProps = ChartProps & ConfigInput;

export class KamajiStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: KamajiStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const KamajiStackBuilder = createChartBuilder({
	chartCtor: KamajiStack,
	configSchema: KamajiStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
