/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestGoldilocksVersion,
	fetchLatest: fetchLatestGoldilocksVersion,
	Latest: LatestGoldilocksVersion,
} = createVersion({
	owner: "FairwindsOps",
	repo: "goldilocks",
	namePrefix: "v",
	knownLatest: "4.15.1",
});

export {
	fetchLatestGoldilocksVersion,
	KnownLatestGoldilocksVersion,
	LatestGoldilocksVersion,
};
