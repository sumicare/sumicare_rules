/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KamajiConsoleChartBuilder } from "Kamaji/Console/KamajiConsoleChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

test("kamaji console chart snapshot", async () => {
	const app = Testing.app();
	const chart = await KamajiConsoleChartBuilder.create(
		app,
		"kamaji-console",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/kamaji-console.snapshot.yaml",
	);
});
