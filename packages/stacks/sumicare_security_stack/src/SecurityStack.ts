/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createChartBuilder } from "@sumicare/chart-commons";
import {
	OpenbaoStack,
	type OpenbaoStackChartProps,
} from "@sumicare/stack-security-openbao";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

const SecurityStackConfigSchema = z.object({}).loose();

type ConfigInput = z.input<typeof SecurityStackConfigSchema>;

export type SecurityStackProps = ChartProps & ConfigInput;

export class SecurityStack extends Chart {
	readonly config: Record<string, unknown>;

	constructor(scope: Construct, id: string, props: SecurityStackProps = {}) {
		super(scope, id, props);
		this.config = props as Record<string, unknown>;

		new OpenbaoStack(
			this,
			"openbao",
			props as unknown as OpenbaoStackChartProps,
		);
	}
}

export const SecurityStackBuilder = createChartBuilder({
	chartCtor: SecurityStack,
	configSchema: SecurityStackConfigSchema,
	latestVersion: Promise.resolve("0.0.0"),
	resolveConfig: (p) => p,
});
