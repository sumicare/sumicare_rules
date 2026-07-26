/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestKamajiVersion,
	fetchLatest: fetchLatestKamajiVersion,
	Latest: LatestKamajiVersion,
} = createVersion({
	owner: "clastix",
	repo: "kamaji",
	knownLatest: "26.7.5-edge",
	nameSuffix: "-edge",
});

export {
	fetchLatestKamajiVersion,
	KnownLatestKamajiVersion,
	LatestKamajiVersion,
};
