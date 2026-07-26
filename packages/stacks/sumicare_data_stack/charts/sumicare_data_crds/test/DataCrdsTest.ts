/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { DataCrdsBuilder } from "Data/Crds/DataCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	DataCrdsBuilder,
	"data-crds",
	"./__snapshots__/data-crds.snapshot.yaml",
);
