/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Snapshot test for the chart-argocd-images. Builds the chart with default
 * config, synthesizes all manifests, and compares them against the
 * committed snapshot file.
 */

import { ArgocdImagesChartBuilder } from "GitOps/ArgoCD/ArgocdImages/ArgocdImagesChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

/**
 * Builds the chart-argocd-images with default config, synthesizes the manifests,
 * sorts them by kind then name, and matches against the snapshot.
 */
test("chart-argocd-images snapshot", async () => {
	const app = Testing.app();
	const chart = await ArgocdImagesChartBuilder.create(
		app,
		"chart-argocd-images",
	).build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/chart-argocd-images.snapshot.yaml",
	);
});
