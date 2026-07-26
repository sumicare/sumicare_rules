/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the openbao-server-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import type { ServerConfig } from "Openbao/Server/Config";
import { OpenbaoServerChart } from "Openbao/Server/OpenbaoServerChart";
import { KnownLatestOpenbaoServerVersion } from "Openbao/Server/Version";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import type { IServiceAccount } from "cdk8s-plus-33";
import { stringify } from "yaml";

const defaultServerConfig: ServerConfig = {
	image: "quay.io/openbao/openbao",
	version: KnownLatestOpenbaoServerVersion,
	replicas: 3,
	resourceTier: "M",
	probes: {
		initialDelaySeconds: 10,
		timeoutSeconds: 5,
		periodSeconds: 10,
		successThreshold: 1,
		failureThreshold: 5,
	},
	storage: {
		size: "10Gi",
	},
	ha: {
		enabled: true,
		replicas: 3,
		raft: {
			enabled: true,
			setNodeId: true,
		},
	},
	serviceType: "ClusterIP",
	logLevel: "info",
	logFormat: "standard",
	priorityClassName: "",
	preStopSleepSeconds: 5,
	hostNetwork: false,
	shareProcessNamespace: false,
	name: "openbao",
	namespace: "vault-system",
	imagePullPolicy: "IfNotPresent",
	runAsUser: 100,
	runAsGroup: 1000,
	fsGroup: 1000,
	revisionHistoryLimit: 10,
};

const mockServiceAccount: IServiceAccount = {
	name: "openbao-server",
} as unknown as IServiceAccount;

test("openbao-server-chart snapshot", async () => {
	const app = Testing.app();
	const chart = new OpenbaoServerChart(app, "openbao-server-chart", {
		config: defaultServerConfig,
		serviceAccount: mockServiceAccount,
	});
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/openbao-server-chart.snapshot.yaml",
	);
});
