/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the mlops-stack. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { MLOpsStackBuilder } from "MlOps/MLOpsStack";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the mlops-stack with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("mlops-stack snapshot", async () => {
	const app = Testing.app();
	const chart = await MLOpsStackBuilder.create(app, "mlops-stack").build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/mlops-stack.snapshot.yaml",
	);
});
