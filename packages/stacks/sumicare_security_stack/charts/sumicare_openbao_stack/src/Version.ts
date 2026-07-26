/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const { KnownLatest, fetchLatest, Latest } = createVersion({
	owner: "openbao",
	repo: "openbao-helm",
	knownLatest: "0.28.6",
});

/** Known latest stable OpenBao Helm chart version. Update when bumping the default. */
export const KnownLatestOpenbaoChartVersion = KnownLatest;
/** Fetches the latest stable OpenBao Helm chart release version from GitHub. */
export const fetchLatestOpenbaoChartVersion = fetchLatest;
/** Resolves to the latest version, falling back to {@link KnownLatestOpenbaoChartVersion} when offline. */
export const LatestOpenbaoChartVersion = Latest;
