/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const { KnownLatest, fetchLatest, Latest } = createVersion({
	owner: "openbao",
	repo: "openbao",
	knownLatest: "2.6.1",
});

/** Known latest stable OpenBao server version. Update when bumping the default. */
export const KnownLatestOpenbaoServerVersion = KnownLatest;
/** Fetches the latest stable OpenBao server release version from GitHub. */
export const fetchLatestOpenbaoServerVersion = fetchLatest;
/** Resolves to the latest version, falling back to {@link KnownLatestOpenbaoServerVersion} when offline. */
export const LatestOpenbaoServerVersion = Latest;
