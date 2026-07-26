/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Data/Crds/CrdSources";
import { createCrdSyncTestFromSources } from "@sumicare/chart-commons-dev/test";

createCrdSyncTestFromSources(CRD_SOURCES, import.meta.url);
