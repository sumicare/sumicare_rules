/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type SnapshotConfig,
	SnapshotConfigError,
	SnapshotConfigMap,
	SnapshotConfigSchema,
} from "Openbao/Snapshot/Config";
import { OpenbaoSnapshotCronJob } from "Openbao/Snapshot/Resources";
import type { ChartProps } from "cdk8s";
import { Chart } from "cdk8s";
import type { Construct } from "constructs";

export type {
	SnapshotChartProps,
	SnapshotConfig,
} from "Openbao/Snapshot/Config";
export {
	SnapshotConfigError,
	SnapshotConfigMap,
	SnapshotConfigSchema,
} from "Openbao/Snapshot/Config";
export {
	KnownLatestOpenbaoSnapshotVersion,
	LatestOpenbaoSnapshotVersion,
} from "Openbao/Snapshot/Version";

export interface OpenbaoSnapshotChartProps extends ChartProps {
	config: SnapshotConfig;
}

export class OpenbaoSnapshotChart extends Chart {
	readonly config: SnapshotConfig;

	constructor(scope: Construct, id: string, props: OpenbaoSnapshotChartProps) {
		super(scope, id, props);

		const result = SnapshotConfigSchema.safeParse(props.config);
		if (!result.success) {
			throw new SnapshotConfigError(id, result.error);
		}
		this.config = result.data;

		new SnapshotConfigMap(this, this.config);
		new OpenbaoSnapshotCronJob(this, this.config);
	}
}
