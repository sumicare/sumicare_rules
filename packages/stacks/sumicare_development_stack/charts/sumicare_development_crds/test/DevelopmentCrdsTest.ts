/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { DevelopmentCrdsBuilder } from "Development/Crds/DevelopmentCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	DevelopmentCrdsBuilder,
	"development-crds",
	"./__snapshots__/development-crds.snapshot.yaml",
);
