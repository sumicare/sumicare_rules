/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { createVersion } from "@sumicare/chart-commons";

const { KnownLatest, fetchLatest, Latest } = createVersion({
	owner: "openbao",
	repo: "openbao-k8s",
	namePrefix: "v",
	knownLatest: "1.4.1",
});

/** Known latest stable openbao-k8s (injector) version. Update when bumping the default. */
export const KnownLatestOpenbaoInjectorVersion = KnownLatest;
/** Fetches the latest stable openbao-k8s release version from GitHub. */
export const fetchLatestOpenbaoInjectorVersion = fetchLatest;
/** Resolves to the latest version, falling back to {@link KnownLatestOpenbaoInjectorVersion} when offline. */
export const LatestOpenbaoInjectorVersion = Latest;
