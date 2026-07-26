/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { SecurityCrdsBuilder } from "Security/Crds/SecurityCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	SecurityCrdsBuilder,
	"security-crds",
	"./__snapshots__/security-crds.snapshot.yaml",
);
