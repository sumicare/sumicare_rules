/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { MlopsCrdsBuilder } from "Mlops/Crds/MlopsCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	MlopsCrdsBuilder,
	"mlops-crds",
	"./__snapshots__/mlops-crds.snapshot.yaml",
);
