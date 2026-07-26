/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestDeschedulerVersion,
	fetchLatest: fetchLatestDeschedulerVersion,
	Latest: LatestDeschedulerVersion,
} = createVersion({
	owner: "kubernetes-sigs",
	repo: "descheduler",
	namePrefix: "Descheduler ",
	knownLatest: "0.36.0",
});

export {
	fetchLatestDeschedulerVersion,
	KnownLatestDeschedulerVersion,
	LatestDeschedulerVersion,
};
