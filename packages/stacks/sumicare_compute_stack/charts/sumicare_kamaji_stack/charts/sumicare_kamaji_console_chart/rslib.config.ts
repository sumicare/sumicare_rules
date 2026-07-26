/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { chartRslibConfig } from "@sumicare/chart-commons-dev";

export default chartRslibConfig({
	entry: "./src/KamajiConsoleChart.ts",
	version: { owner: "clastix", repo: "kamaji-console", namePrefix: "v" },
});
