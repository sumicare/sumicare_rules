/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const GitopsStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof GitopsStackConfigSchema>;

export type GitopsStackProps = ChartProps & ConfigInput;

export class GitopsStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: GitopsStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const GitopsStackBuilder = createChartBuilder({
	chartCtor: GitopsStack,
	configSchema: GitopsStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
