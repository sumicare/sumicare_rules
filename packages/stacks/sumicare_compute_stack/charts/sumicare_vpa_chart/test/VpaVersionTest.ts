/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Version test for the VPA chart. Verifies that the pinned
 * {@link KnownLatestVpaVersion} matches the actual latest stable
 * release from GitHub. Skipped when the network is unavailable.
 */

import {
	fetchLatestVpaVersion,
	KnownLatestVpaVersion,
} from "Compute/Vpa/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

test("KnownLatestVpaVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}

	const latest = await fetchLatestVpaVersion();
	expect(KnownLatestVpaVersion).toBe(latest);
});
