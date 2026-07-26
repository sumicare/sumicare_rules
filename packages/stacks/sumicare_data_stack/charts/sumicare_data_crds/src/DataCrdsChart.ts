/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Data/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: DataCrds,
	Builder: DataCrdsBuilder,
	ConfigSchema: DataCrdsConfigSchema,
	ConfigError: DataCrdsConfigError,
} = defineCrds({
	name: "DataCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link DataCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type DataCrdsProps = ChartProps & z.input<typeof DataCrdsConfigSchema>;

export * from "Data/Crds/Crds";

export { DataCrds, DataCrdsBuilder, DataCrdsConfigError, DataCrdsConfigSchema };
