/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the openbao-injector-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import {
	type Config as InjectorConfig,
	InjectorConfigSchema,
	injectorConfig,
} from "Openbao/Injector/Config";
import { OpenbaoInjectorChart } from "Openbao/Injector/OpenbaoInjectorChart";
import { KnownLatestOpenbaoInjectorVersion } from "Openbao/Injector/Version";
import { expect, test } from "@rstest/core";
import { KnownLatestOpenbaoServerVersion } from "@sumicare/chart-security-openbao-server";
import { Testing } from "cdk8s";
import type { IServiceAccount } from "cdk8s-plus-33";
import { stringify } from "yaml";

const defaultInjectorConfig: InjectorConfig = injectorConfig.resolveConfig!(
	InjectorConfigSchema.parse({
		enabled: true,
		image: "openbao/openbao-k8s",
		version: KnownLatestOpenbaoInjectorVersion,
		agentImage: "quay.io/openbao/openbao",
		agentVersion: KnownLatestOpenbaoServerVersion,
		name: "openbao",
		namespace: "vault-system",
		imagePullPolicy: "IfNotPresent",
		runAsUser: 1000,
		runAsGroup: 1000,
		fsGroup: 1000,
		revisionHistoryLimit: 10,
	}),
) as InjectorConfig;

const mockServiceAccount: IServiceAccount = {
	name: "openbao-injector",
} as unknown as IServiceAccount;

/**
 * Builds the openbao-injector-chart with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("openbao-injector-chart snapshot", async () => {
	const app = Testing.app();
	const chart = new OpenbaoInjectorChart(app, "openbao-injector-chart", {
		config: defaultInjectorConfig,
		serviceAccount: mockServiceAccount,
	});
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/openbao-injector-chart.snapshot.yaml",
	);
});
