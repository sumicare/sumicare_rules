/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type CsiConfig,
	CsiConfigError,
	CsiConfigMap,
	CsiConfigSchema,
} from "Openbao/Csi/Config";
import { OpenbaoCsiDaemonSet } from "Openbao/Csi/Resources";
import type { ChartProps } from "cdk8s";
import { Chart } from "cdk8s";
import type { Construct } from "constructs";

export type { CsiChartProps, CsiConfig } from "Openbao/Csi/Config";
export {
	CsiConfigError,
	CsiConfigMap,
	CsiConfigSchema,
} from "Openbao/Csi/Config";
export {
	KnownLatestOpenbaoCsiVersion,
	LatestOpenbaoCsiVersion,
} from "Openbao/Csi/Version";

export interface OpenbaoCsiChartProps extends ChartProps {
	config: CsiConfig;
}

export class OpenbaoCsiChart extends Chart {
	readonly config: CsiConfig;

	constructor(scope: Construct, id: string, props: OpenbaoCsiChartProps) {
		super(scope, id, props);

		const result = CsiConfigSchema.safeParse(props.config);
		if (!result.success) {
			throw new CsiConfigError(id, result.error);
		}
		this.config = result.data;

		if (this.config.agent.enabled) {
			new CsiConfigMap(this, this.config);
		}
		new OpenbaoCsiDaemonSet(this, this.config);
	}
}
