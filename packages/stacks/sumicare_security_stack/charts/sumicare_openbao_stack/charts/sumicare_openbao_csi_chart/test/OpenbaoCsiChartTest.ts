/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the openbao-csi-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import type { CsiConfig } from "Openbao/Csi/Config";
import { OpenbaoCsiChart } from "Openbao/Csi/OpenbaoCsiChart";
import { KnownLatestOpenbaoCsiVersion } from "Openbao/Csi/Version";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

const defaultCsiConfig: CsiConfig = {
	enabled: true,
	image: "quay.io/openbao/openbao-csi-provider",
	version: KnownLatestOpenbaoCsiVersion,
	namespace: "vault-system",
	hmacSecretName: "openbao-csi-provider-hmac-key",
	debug: false,
	endpoint: "/provider/openbao.sock",
	providersDir: "/etc/kubernetes/secrets-store-csi-providers",
	healthAddr: ":8080",
	cacheSize: 1000,
	openbaoMount: "kubernetes",
	openbaoNamespace: "",
	extraArgs: {},
	priorityClassName: "",
	tolerations: [],
	nodeSelector: {},
	affinity: null,
	agent: {
		enabled: false,
		image: "quay.io/openbao/openbao",
		logLevel: "info",
		logFormat: "standard",
		extraArgs: {},
		resourceTier: "S",
	},
	updateStrategy: {
		type: "RollingUpdate",
		maxUnavailable: "",
	},
	resourceTier: "S",
	name: "openbao",
	imagePullPolicy: "IfNotPresent",
	runAsUser: 100,
	runAsGroup: 1000,
	fsGroup: 1000,
	revisionHistoryLimit: 10,
};

test("openbao-csi-chart snapshot", async () => {
	const app = Testing.app();
	const chart = new OpenbaoCsiChart(app, "openbao-csi-chart", {
		config: defaultCsiConfig,
	});
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/openbao-csi-chart.snapshot.yaml",
	);
});
