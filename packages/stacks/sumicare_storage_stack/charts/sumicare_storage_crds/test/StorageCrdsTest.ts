/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { StorageCrdsBuilder } from "Storage/Crds/StorageCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	StorageCrdsBuilder,
	"storage-crds",
	"./__snapshots__/storage-crds.snapshot.yaml",
);
