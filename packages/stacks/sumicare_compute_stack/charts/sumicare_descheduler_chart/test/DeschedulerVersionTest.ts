/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

/**
 * Verifies that {@link KnownLatestDeschedulerVersion} matches the actual
 * latest stable descheduler release on GitHub.
 *
 * Skipped automatically when the network is unavailable.
 */

import {
	fetchLatestDeschedulerVersion,
	KnownLatestDeschedulerVersion,
} from "Compute/Descheduler/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

/**
 * Fetches the latest descheduler release from GitHub and asserts it equals
 * the pinned {@link KnownLatestDeschedulerVersion} constant.
 */
test("KnownLatestDeschedulerVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}
	const latest = await fetchLatestDeschedulerVersion();
	expect(KnownLatestDeschedulerVersion).toBe(latest);
});
