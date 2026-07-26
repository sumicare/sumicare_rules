/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Openbao/Injector/Config";
import {
	createOpenbaoInjectorDeployment,
	OpenbaoInjectorMutatingWebhook,
	OpenbaoInjectorService,
} from "Openbao/Injector/Resources";
import type { ChartProps } from "cdk8s";
import { Chart } from "cdk8s";
import type { IServiceAccount } from "cdk8s-plus-33";
import type { Construct } from "constructs";

export type {
	Config as InjectorConfig,
	InjectorChartProps,
} from "Openbao/Injector/Config";
export {
	InjectorConfigError,
	InjectorConfigSchema,
	injectorConfig,
} from "Openbao/Injector/Config";
export {
	KnownLatestOpenbaoInjectorVersion,
	LatestOpenbaoInjectorVersion,
} from "Openbao/Injector/Version";

export interface OpenbaoInjectorChartProps extends ChartProps {
	config: Config;
	serviceAccount: IServiceAccount;
}

export class OpenbaoInjectorChart extends Chart {
	constructor(scope: Construct, id: string, props: OpenbaoInjectorChartProps) {
		super(scope, id, props);

		new OpenbaoInjectorService(this, props.config);
		new OpenbaoInjectorMutatingWebhook(this, props.config);
		createOpenbaoInjectorDeployment(this, props.config, props.serviceAccount);
	}
}
