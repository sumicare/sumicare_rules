/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the openbao-snapshot-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import type { SnapshotConfig } from "Openbao/Snapshot/Config";
import { OpenbaoSnapshotChart } from "Openbao/Snapshot/OpenbaoSnapshotChart";
import { KnownLatestOpenbaoSnapshotVersion } from "Openbao/Snapshot/Version";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

const defaultSnapshotConfig: SnapshotConfig = {
	enabled: true,
	image: "ghcr.io/openbao/openbao-snapshot-agent",
	version: KnownLatestOpenbaoSnapshotVersion,
	schedule: "0 * * * *",
	restartPolicy: "Never",
	s3: {
		host: "https://s3.example.com",
		bucket: "openbao-snapshots",
		uri: "s3://openbao-snapshots",
	},
	bao: {
		addr: "https://openbao.vault-system.svc:8200",
		authPath: "kubernetes",
		role: "bao-raft-snapshot",
	},
	credentialsSecret: "bao-snapshot-credentials",
	resourceTier: "S",
	tolerations: [],
	name: "openbao",
	namespace: "vault-system",
	imagePullPolicy: "IfNotPresent",
	runAsUser: 100,
	runAsGroup: 1000,
	fsGroup: 1000,
	revisionHistoryLimit: 10,
};

test("openbao-snapshot-chart snapshot", async () => {
	const app = Testing.app();
	const chart = new OpenbaoSnapshotChart(app, "openbao-snapshot-chart", {
		config: defaultSnapshotConfig,
	});
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/openbao-snapshot-chart.snapshot.yaml",
	);
});
