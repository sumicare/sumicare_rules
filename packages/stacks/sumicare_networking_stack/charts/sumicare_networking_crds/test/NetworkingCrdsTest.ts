/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { NetworkingCrdsBuilder } from "Networking/Crds/NetworkingCrdsChart";
import { createCrdsChartSnapshotTest } from "@sumicare/chart-commons-dev/test";

createCrdsChartSnapshotTest(
	NetworkingCrdsBuilder,
	"networking-crds",
	"./__snapshots__/networking-crds.snapshot.yaml",
);
