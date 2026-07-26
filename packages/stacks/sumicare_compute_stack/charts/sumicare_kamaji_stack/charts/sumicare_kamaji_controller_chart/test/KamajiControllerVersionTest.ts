/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	fetchLatestKamajiVersion,
	KnownLatestKamajiVersion,
} from "Kamaji/Controller/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

test("KnownLatestKamajiVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}
	const latest = await fetchLatestKamajiVersion();
	expect(KnownLatestKamajiVersion).toBe(latest);
});
