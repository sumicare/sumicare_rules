/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the tektoncd-stack. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { TektoncdStackBuilder } from "Development/TektonCD/TektoncdStack";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the tektoncd-stack with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("tektoncd-stack snapshot", async () => {
	const app = Testing.app();
	const chart = await TektoncdStackBuilder.create(
		app,
		"tektoncd-stack",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/tektoncd-stack.snapshot.yaml",
	);
});
