/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ComputeCrdsBuilder } from "Compute/Crds/ComputeCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	ComputeCrdsBuilder,
	"compute-crds",
	"./__snapshots__/compute-crds.snapshot.yaml",
);
