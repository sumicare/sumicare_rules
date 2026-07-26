/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestKamajiConsoleVersion,
	fetchLatest: fetchLatestKamajiConsoleVersion,
	Latest: LatestKamajiConsoleVersion,
} = createVersion({
	owner: "clastix",
	repo: "kamaji-console",
	namePrefix: "v",
	knownLatest: "0.2.1",
});

export {
	fetchLatestKamajiConsoleVersion,
	KnownLatestKamajiConsoleVersion,
	LatestKamajiConsoleVersion,
};
