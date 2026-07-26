/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the grafana-mcp-chart. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { GrafanaMCPChartBuilder } from "Observability/GrafanaMcp/GrafanaMCPChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the grafana-mcp-chart with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("grafana-mcp-chart snapshot", async () => {
	const app = Testing.app();
	const chart = await GrafanaMCPChartBuilder.create(
		app,
		"grafana-mcp-chart",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/grafana-mcp-chart.snapshot.yaml",
	);
});
