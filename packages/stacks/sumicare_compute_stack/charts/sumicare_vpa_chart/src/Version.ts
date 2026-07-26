/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestVpaVersion,
	fetchLatest: fetchLatestVpaVersion,
	Latest: LatestVpaVersion,
} = createVersion({
	owner: "kubernetes",
	repo: "autoscaler",
	namePrefix: "vertical-pod-autoscaler-",
	knownLatest: "1.7.1",
});

export { fetchLatestVpaVersion, KnownLatestVpaVersion, LatestVpaVersion };
