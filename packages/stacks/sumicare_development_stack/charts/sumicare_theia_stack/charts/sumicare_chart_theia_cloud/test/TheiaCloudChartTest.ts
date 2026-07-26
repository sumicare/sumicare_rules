/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the chart-theia-cloud. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { TheiaCloudChartBuilder } from "Development/Theia/Cloud/TheiaCloudChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the chart-theia-cloud with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("chart-theia-cloud snapshot", async () => {
	const app = Testing.app();
	const chart = await TheiaCloudChartBuilder.create(
		app,
		"chart-theia-cloud",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/chart-theia-cloud.snapshot.yaml",
	);
});
