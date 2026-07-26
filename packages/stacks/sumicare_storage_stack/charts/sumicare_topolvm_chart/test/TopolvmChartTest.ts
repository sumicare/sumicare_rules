/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the topolvm-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { TopolvmChartBuilder } from "Storage/Topolvm/TopolvmChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the topolvm-chart with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("topolvm-chart snapshot", async () => {
	const app = Testing.app();
	const chart = await TopolvmChartBuilder.create(app, "topolvm-chart").build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/topolvm-chart.snapshot.yaml",
	);
});
