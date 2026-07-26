/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestKedaVersion,
	fetchLatest: fetchLatestKedaVersion,
	Latest: LatestKedaVersion,
} = createVersion({
	owner: "kedacore",
	repo: "keda",
	knownLatest: "2.20.2",
});

export { fetchLatestKedaVersion, KnownLatestKedaVersion, LatestKedaVersion };
