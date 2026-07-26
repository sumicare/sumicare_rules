/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { chartRslibConfig } from "@sumicare/chart-commons-dev";

export default chartRslibConfig({
	entry: "./src/KamajiEtcdChart.ts",
	version: { owner: "etcd-io", repo: "etcd", namePrefix: "v" },
});
