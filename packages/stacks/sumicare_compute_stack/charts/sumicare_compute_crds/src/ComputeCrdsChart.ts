/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Compute/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";
import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: ComputeCrds,
	Builder: ComputeCrdsBuilder,
	ConfigSchema: ComputeCrdsConfigSchema,
	ConfigError: ComputeCrdsConfigError,
} = defineCrds({
	name: "ComputeCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link ComputeCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type ComputeCrdsProps = ChartProps &
	z.input<typeof ComputeCrdsConfigSchema>;

export * from "Compute/Crds/Crds";

export {
	ComputeCrds,
	ComputeCrdsBuilder,
	ComputeCrdsConfigError,
	ComputeCrdsConfigSchema,
};
