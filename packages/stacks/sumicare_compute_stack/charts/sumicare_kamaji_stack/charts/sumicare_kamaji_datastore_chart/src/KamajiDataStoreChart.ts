/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type Config,
	KamajiDataStoreConfigError,
	KamajiDataStoreConfigSchema,
	kamajiDataStoreConfig,
} from "Kamaji/DataStore/Config";
import {
	KnownLatestKamajiDataStoreVersion,
	LatestKamajiDataStoreVersion,
} from "Kamaji/DataStore/Version";
import { commonLabels, createChartBuilder } from "@sumicare/chart-commons";
import { ApiObject, Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import type { z } from "zod";

type ConfigInput = z.input<typeof KamajiDataStoreConfigSchema>;

export type KamajiDataStoreChartProps = ChartProps & ConfigInput;

/**
 * CDK8s chart that generates a Kamaji DataStore custom resource.
 *
 * The DataStore defines the backing datastore (etcd, MySQL, PostgreSQL)
 * for Kamaji Tenant Control Planes, including TLS configuration for
 * secure communication.
 */
export class KamajiDataStoreChart extends Chart {
	readonly config: Config;
	readonly dataStore: ApiObject;

	constructor(
		scope: Construct,
		id: string,
		props: KamajiDataStoreChartProps = {},
	) {
		super(scope, id, props);

		const result = KamajiDataStoreConfigSchema.safeParse(props);
		if (!result.success) {
			throw new KamajiDataStoreConfigError(id, result.error);
		}
		this.config = result.data;

		const labels = {
			...commonLabels(this.config),
			"kamaji.clastix.io/datastore": this.config.driver,
			...this.config.labels,
		};

		const spec: Record<string, unknown> = {
			driver: this.config.driver,
			endpoints: this.config.endpoints,
		};

		if (this.config.tlsConfig) {
			spec.tlsConfig = this.config.tlsConfig;
		}

		this.dataStore = new ApiObject(this, "datastore", {
			apiVersion: "kamaji.clastix.io/v1alpha1",
			kind: "DataStore",
			metadata: {
				name: this.config.name,
				labels,
			},
			spec,
		});
	}
}

export const KamajiDataStoreChartBuilder = createChartBuilder({
	chartCtor: KamajiDataStoreChart,
	configSchema: KamajiDataStoreConfigSchema,
	latestVersion: LatestKamajiDataStoreVersion,
	resolveConfig: kamajiDataStoreConfig.resolveConfig as
		| ((parsed: Record<string, unknown>) => Record<string, unknown>)
		| undefined,
});

export { KnownLatestKamajiDataStoreVersion, LatestKamajiDataStoreVersion };
