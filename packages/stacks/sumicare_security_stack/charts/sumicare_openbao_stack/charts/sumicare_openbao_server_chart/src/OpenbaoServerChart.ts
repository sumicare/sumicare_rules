/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type ServerConfig,
	ServerConfigError,
	ServerConfigSchema,
} from "Openbao/Server/Config";
import {
	OpenbaoServerHaService,
	OpenbaoServerHeadlessService,
	OpenbaoServerService,
	OpenbaoServerStandbyService,
	OpenbaoServerStatefulSet,
	ServerConfigMap,
} from "Openbao/Server/Resources";
import type { ChartProps } from "cdk8s";
import { Chart } from "cdk8s";
import type { IServiceAccount } from "cdk8s-plus-33";
import type { Construct } from "constructs";

export type {
	ServerChartProps,
	ServerConfig,
} from "Openbao/Server/Config";
export {
	ServerConfigError,
	ServerConfigMap,
	ServerConfigSchema,
} from "Openbao/Server/Config";
export {
	KnownLatestOpenbaoServerVersion,
	LatestOpenbaoServerVersion,
} from "Openbao/Server/Version";

export interface OpenbaoServerChartProps extends ChartProps {
	config: ServerConfig;
	serviceAccount: IServiceAccount;
}

export class OpenbaoServerChart extends Chart {
	readonly config: ServerConfig;

	constructor(scope: Construct, id: string, props: OpenbaoServerChartProps) {
		super(scope, id, props);

		const result = ServerConfigSchema.safeParse(props.config);
		if (!result.success) {
			throw new ServerConfigError(id, result.error);
		}
		this.config = result.data;

		new ServerConfigMap(this, this.config);
		new OpenbaoServerService(this, this.config);
		new OpenbaoServerHeadlessService(this, this.config);
		new OpenbaoServerHaService(this, this.config);
		new OpenbaoServerStandbyService(this, this.config);
		new OpenbaoServerStatefulSet(this, this.config, props.serviceAccount);
	}
}
