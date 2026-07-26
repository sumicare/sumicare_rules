/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the flink-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { NatsChartBuilder } from "Data/Nats/NatsChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the flink-chart with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("flink-chart snapshot", async () => {
	const app = Testing.app();
	const chart = await NatsChartBuilder.create(app, "flink-chart").build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/flink-chart.snapshot.yaml",
	);
});
