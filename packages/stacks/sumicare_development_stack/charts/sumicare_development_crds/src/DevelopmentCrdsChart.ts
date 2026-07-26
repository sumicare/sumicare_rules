/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Development/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: DevelopmentCrds,
	Builder: DevelopmentCrdsBuilder,
	ConfigSchema: DevelopmentCrdsConfigSchema,
	ConfigError: DevelopmentCrdsConfigError,
} = defineCrds({
	name: "DevelopmentCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link DevelopmentCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type DevelopmentCrdsProps = ChartProps &
	z.input<typeof DevelopmentCrdsConfigSchema>;

export * from "Development/Crds/Crds";

export {
	DevelopmentCrds,
	DevelopmentCrdsBuilder,
	DevelopmentCrdsConfigError,
	DevelopmentCrdsConfigSchema,
};
