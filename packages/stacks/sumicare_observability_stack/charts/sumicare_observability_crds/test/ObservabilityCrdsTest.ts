/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ObservabilityCrdsBuilder } from "Observability/Crds/ObservabilityCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	ObservabilityCrdsBuilder,
	"observability-crds",
	"./__snapshots__/observability-crds.snapshot.yaml",
);
