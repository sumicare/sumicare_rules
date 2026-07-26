/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { chartRslibConfig } from "@sumicare/chart-commons-dev";
import { CRD_SOURCES } from "./src/CrdSources";

export default chartRslibConfig({
	entry: "./src/StorageCrdsChart.ts",
	crds: { upstream: CRD_SOURCES.upstream },
});
