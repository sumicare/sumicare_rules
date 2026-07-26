/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KamajiEtcdChartBuilder } from "Kamaji/Etcd/KamajiEtcdChart";
import { expect, test } from "@rstest/core";
import { Testing } from "cdk8s";
import { stringify } from "yaml";

test("kamaji etcd chart snapshot", async () => {
	const app = Testing.app();
	const chart = await KamajiEtcdChartBuilder.create(app, "kamaji-etcd").build();
	const manifests = Testing.synth(chart).sort(
		(a, b) =>
			(a.kind ?? "").localeCompare(b.kind ?? "") ||
			(a.metadata?.name ?? "").localeCompare(b.metadata?.name ?? ""),
	);
	const actual = stringify(manifests, { sortMapEntries: true });
	await expect(actual).toMatchFileSnapshot(
		"./__snapshots__/kamaji-etcd.snapshot.yaml",
	);
});
