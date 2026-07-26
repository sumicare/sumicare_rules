/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	OpenbaoConfigError,
	OpenbaoStackConfigSchema,
	openbaoStackConfig,
} from "Security/Openbao/Config";
import {
	OpenbaoPodDisruptionBudget,
	OpenbaoPrometheusRule,
	OpenbaoServiceMonitor,
} from "Security/Openbao/CustomResources";
import {
	createOpenbaoRbac,
	type OpenbaoRbacConstruct,
} from "Security/Openbao/Resources";
import { OpenbaoNetworkPolicy } from "Security/Openbao/Resources/NetworkPolicy";
import {
	KnownLatestOpenbaoChartVersion,
	LatestOpenbaoChartVersion,
} from "Security/Openbao/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import {
	type CsiConfig,
	CsiConfigSchema,
	OpenbaoCsiChart,
} from "@sumicare/chart-security-openbao-csi";
import {
	type InjectorConfig,
	InjectorConfigSchema,
	injectorConfig,
	OpenbaoInjectorChart,
} from "@sumicare/chart-security-openbao-injector";
import {
	OpenbaoServerChart,
	type ServerConfig,
	ServerConfigSchema,
} from "@sumicare/chart-security-openbao-server";
import {
	OpenbaoSnapshotChart,
	type SnapshotConfig,
	SnapshotConfigSchema,
} from "@sumicare/chart-security-openbao-snapshot";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof OpenbaoStackConfigSchema>;

export type OpenbaoStackChartProps = ChartProps &
	ConfigInput & { env?: string };

function resolveSubConfig(config: Config): {
	server: ServerConfig;
	injector: InjectorConfig;
	csi: CsiConfig;
	snapshot?: SnapshotConfig;
} {
	const shared = {
		name: config.name,
		namespace: config.namespace,
		imagePullPolicy: config.imagePullPolicy,
		runAsUser: config.runAsUser,
		runAsGroup: config.runAsGroup,
		fsGroup: config.fsGroup,
		revisionHistoryLimit: config.revisionHistoryLimit,
	};

	return {
		server: ServerConfigSchema.parse({ ...config.server, ...shared }),
		injector: injectorConfig.resolveConfig!(
			InjectorConfigSchema.parse({
				...config.injector,
				...shared,
			}),
		) as InjectorConfig,
		csi: CsiConfigSchema.parse({ ...config.csi, ...shared }),
		snapshot: config.snapshotAgent
			? SnapshotConfigSchema.parse({ ...config.snapshotAgent, ...shared })
			: undefined,
	};
}

export class OpenbaoStack extends Chart {
	readonly config: Config;
	readonly rbac: OpenbaoRbacConstruct;

	constructor(scope: Construct, id: string, props: OpenbaoStackChartProps) {
		super(scope, id, props);

		const { env: _env, ...configProps } = props;
		const result = OpenbaoStackConfigSchema.safeParse(configProps);
		if (!result.success) {
			throw new OpenbaoConfigError(id, result.error);
		}

		this.config = result.data as Config;

		this.rbac = createOpenbaoRbac(this, this.config);

		const sub = resolveSubConfig(this.config);

		new OpenbaoServerChart(this, "server", {
			config: sub.server,
			serviceAccount: this.rbac.serviceAccounts.server,
		});

		if (this.config.injector.enabled) {
			new OpenbaoInjectorChart(this, "injector", {
				config: sub.injector,
				serviceAccount: this.rbac.serviceAccounts.injector,
			});
		}

		if (this.config.csi.enabled) {
			new OpenbaoCsiChart(this, "csi", {
				config: sub.csi,
			});
		}

		if (this.config.snapshotAgent?.enabled) {
			new OpenbaoSnapshotChart(this, "snapshot", {
				config: sub.snapshot!,
			});
		}

		new OpenbaoNetworkPolicy(this, this.config);

		new OpenbaoPodDisruptionBudget(this, this.config);

		new OpenbaoServiceMonitor(this, this.config);

		new OpenbaoPrometheusRule(this, this.config);
	}
}

export const OpenbaoStackBuilder = createChartBuilder({
	chartCtor: OpenbaoStack,
	configSchema: OpenbaoStackConfigSchema,
	latestVersion: LatestOpenbaoChartVersion,
	resolveConfig: openbaoStackConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestOpenbaoChartVersion, LatestOpenbaoChartVersion };
