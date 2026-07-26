/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Version test for the KEDA chart. Verifies that the pinned
 * {@link KnownLatestKedaVersion} matches the actual latest stable
 * release from GitHub. Skipped when the network is unavailable.
 */

import {
	fetchLatestKedaVersion,
	KnownLatestKedaVersion,
} from "Compute/Keda/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

test("KnownLatestKedaVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}

	const latest = await fetchLatestKedaVersion();
	expect(KnownLatestKedaVersion).toBe(latest);
});
