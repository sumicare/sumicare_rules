/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { GoldilocksControllerChartBuilder } from "Goldilocks/Controller/GoldilocksControllerChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

test("goldilocks controller chart snapshot", async () => {
	const app = Testing.app();
	const chart = await GoldilocksControllerChartBuilder.create(
		app,
		"goldilocks-controller",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/goldilocks-controller.snapshot.yaml",
	);
});
