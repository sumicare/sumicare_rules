/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Mlops/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: MlopsCrds,
	Builder: MlopsCrdsBuilder,
	ConfigSchema: MlopsCrdsConfigSchema,
	ConfigError: MlopsCrdsConfigError,
} = defineCrds({
	name: "MlopsCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link MlopsCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type MlopsCrdsProps = ChartProps & z.input<typeof MlopsCrdsConfigSchema>;

export * from "Mlops/Crds/Crds";

export {
	MlopsCrds,
	MlopsCrdsBuilder,
	MlopsCrdsConfigError,
	MlopsCrdsConfigSchema,
};
