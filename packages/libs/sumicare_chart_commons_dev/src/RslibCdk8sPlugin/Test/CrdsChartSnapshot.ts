/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { expect, test } from "@rstest/core";
import { type ApiObject, type Chart, Testing } from "cdk8s";
import type { Construct } from "constructs";
import { stringify } from "yaml";

type CrdsBuilder = {
	create: (scope: Construct, id: string) => { build: () => Chart };
};

/**
 * Creates a snapshot test for a CRDs chart. Synthesizes all enabled
 * CRD manifests and compares them against the committed snapshot file.
 */
export const createCrdsChartSnapshotTest = (
	Builder: CrdsBuilder,
	chartId: string,
	snapshotPath: string,
) => {
	test(`${chartId} chart snapshot`, async () => {
		const app = Testing.app();
		const chart = Builder.create(app, chartId).build();
		const manifests = Testing.synth(chart).sort((a: ApiObject, b: ApiObject) =>
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
		);
		const actual = stringify(manifests, { sortMapEntries: true });
		await expect(actual).toMatchFileSnapshot(snapshotPath);
	});
};
