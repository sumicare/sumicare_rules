/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	fetchLatestKamajiEtcdVersion,
	KnownLatestKamajiEtcdVersion,
} from "Kamaji/Etcd/Version";
import { expect, test } from "@rstest/core";
import { hasNetwork } from "@sumicare/chart-commons-dev/test";

test("KnownLatestKamajiEtcdVersion is up to date", async ({ skip }) => {
	if (!(await hasNetwork())) {
		skip();
		return;
	}
	const latest = await fetchLatestKamajiEtcdVersion();
	expect(KnownLatestKamajiEtcdVersion).toBe(latest);
});
