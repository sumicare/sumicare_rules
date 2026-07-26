/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Storage/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: StorageCrds,
	Builder: StorageCrdsBuilder,
	ConfigSchema: StorageCrdsConfigSchema,
	ConfigError: StorageCrdsConfigError,
} = defineCrds({
	name: "StorageCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link StorageCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type StorageCrdsProps = ChartProps &
	z.input<typeof StorageCrdsConfigSchema>;

export * from "Storage/Crds/Crds";

export {
	StorageCrds,
	StorageCrdsBuilder,
	StorageCrdsConfigError,
	StorageCrdsConfigSchema,
};
