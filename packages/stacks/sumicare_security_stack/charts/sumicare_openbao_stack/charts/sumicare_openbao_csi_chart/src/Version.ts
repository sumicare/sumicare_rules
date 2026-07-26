/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const { KnownLatest, fetchLatest, Latest } = createVersion({
	owner: "openbao",
	repo: "openbao-csi-provider",
	namePrefix: "v",
	knownLatest: "2.0.2",
});

/** Known latest stable OpenBao CSI provider version. Update when bumping the default. */
export const KnownLatestOpenbaoCsiVersion = KnownLatest;
/** Fetches the latest stable OpenBao CSI provider release version from GitHub. */
export const fetchLatestOpenbaoCsiVersion = fetchLatest;
/** Resolves to the latest version, falling back to {@link KnownLatestOpenbaoCsiVersion} when offline. */
export const LatestOpenbaoCsiVersion = Latest;
