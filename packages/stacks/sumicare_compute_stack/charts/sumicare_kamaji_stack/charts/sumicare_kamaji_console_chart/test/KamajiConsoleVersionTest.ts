/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	fetchLatestKamajiConsoleVersion,
	KnownLatestKamajiConsoleVersion,
} from "Kamaji/Console/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

test("KnownLatestKamajiConsoleVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}
	const latest = await fetchLatestKamajiConsoleVersion();
	expect(KnownLatestKamajiConsoleVersion).toBe(latest);
});
