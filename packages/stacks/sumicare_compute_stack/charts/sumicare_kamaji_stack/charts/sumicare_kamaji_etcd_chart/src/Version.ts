/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const {
	KnownLatest: KnownLatestKamajiEtcdVersion,
	fetchLatest: fetchLatestKamajiEtcdVersion,
	Latest: LatestKamajiEtcdVersion,
} = createVersion({
	owner: "etcd-io",
	repo: "etcd",
	namePrefix: "v",
	knownLatest: "3.7.1",
});

export {
	fetchLatestKamajiEtcdVersion,
	KnownLatestKamajiEtcdVersion,
	LatestKamajiEtcdVersion,
};
