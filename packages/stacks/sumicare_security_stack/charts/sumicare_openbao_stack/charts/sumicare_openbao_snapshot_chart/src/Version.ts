/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const { KnownLatest, fetchLatest, Latest } = createVersion({
	owner: "openbao",
	repo: "openbao-snapshot-agent",
	namePrefix: "v",
	knownLatest: "0.3.0",
});

/** Known latest stable OpenBao snapshot agent version. Update when bumping the default. */
export const KnownLatestOpenbaoSnapshotVersion = KnownLatest;
/** Fetches the latest stable OpenBao snapshot agent release version from GitHub. */
export const fetchLatestOpenbaoSnapshotVersion = fetchLatest;
/** Resolves to the latest version, falling back to {@link KnownLatestOpenbaoSnapshotVersion} when offline. */
export const LatestOpenbaoSnapshotVersion = Latest;
