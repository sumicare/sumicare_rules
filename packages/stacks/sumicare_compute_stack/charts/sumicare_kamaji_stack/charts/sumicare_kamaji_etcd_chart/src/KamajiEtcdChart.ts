/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	etcdConfig,
	KamajiEtcdConfigError,
	KamajiEtcdConfigSchema,
} from "Kamaji/Etcd/Config";
import {
	createEtcdRbac,
	EtcdCsrConfigMap,
	EtcdJobs,
	EtcdService,
	EtcdStatefulSet,
} from "Kamaji/Etcd/Resources";
import {
	KnownLatestKamajiEtcdVersion,
	LatestKamajiEtcdVersion,
} from "Kamaji/Etcd/Version";
import { createChartBuilder } from "@sumicare/chart-commons";
import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiEtcdConfigSchema>;

export type KamajiEtcdChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates all Kubernetes resources for the Kamaji
 * etcd cluster: ServiceAccount, Role/RoleBinding, headless Service,
 * CSR ConfigMap, cert generation Job, setup Job, teardown Job,
 * and the etcd StatefulSet with TLS.
 */
export class KamajiEtcdChart extends Chart {
	readonly config: Config;

	constructor(scope: Construct, id: string, props: KamajiEtcdChartProps) {
		super(scope, id, props);

		const result = KamajiEtcdConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiEtcdConfigError(id, result.error);
		}
		this.config = result.data;

		const rbac = createEtcdRbac(this, this.config);
		const csrConfigMap = new EtcdCsrConfigMap(this, this.config);
		new EtcdService(this, this.config);
		new EtcdStatefulSet(this, this.config);
		new EtcdJobs(
			this,
			this.config,
			csrConfigMap.configMap.name,
			rbac.serviceAccounts.etcd.name,
		);
	}
}

export const KamajiEtcdChartBuilder = createChartBuilder({
	chartCtor: KamajiEtcdChart,
	configSchema: KamajiEtcdConfigSchema,
	latestVersion: LatestKamajiEtcdVersion,
	resolveConfig: etcdConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKamajiEtcdVersion, LatestKamajiEtcdVersion };
