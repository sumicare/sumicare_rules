/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { GitopsCrdsBuilder } from "Gitops/Crds/GitopsCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	GitopsCrdsBuilder,
	"gitops-crds",
	"./__snapshots__/gitops-crds.snapshot.yaml",
);
