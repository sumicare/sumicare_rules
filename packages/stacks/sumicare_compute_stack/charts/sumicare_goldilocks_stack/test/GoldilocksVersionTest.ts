/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { expect, test } from "@rstest/core";
import { fetchLatestRelease } from "@sumicare/chart-commons";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";
import { KnownLatestGoldilocksVersion } from "@sumicare/chart-compute-goldilocks-controller";

test("KnownLatestGoldilocksVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}
	const latest = await fetchLatestRelease({
		owner: "FairwindsOps",
		repo: "goldilocks",
		namePrefix: "v",
	});
	expect(KnownLatestGoldilocksVersion).toBe(latest);
});
