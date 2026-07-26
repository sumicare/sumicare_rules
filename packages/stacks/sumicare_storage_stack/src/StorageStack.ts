/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const StorageStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof StorageStackConfigSchema>;

export type StorageStackProps = ChartProps & ConfigInput;

export class StorageStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: StorageStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;
	}
}

export const StorageStackBuilder = createChartBuilder({
	chartCtor: StorageStack,
	configSchema: StorageStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
