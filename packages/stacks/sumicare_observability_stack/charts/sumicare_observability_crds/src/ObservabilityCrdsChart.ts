/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Observability/Crds/CrdSources";

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";
import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: ObservabilityCrds,
	Builder: ObservabilityCrdsBuilder,
	ConfigSchema: ObservabilityCrdsConfigSchema,
	ConfigError: ObservabilityCrdsConfigError,
} = defineCrds({
	name: "ObservabilityCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
});

/** Props for {@link ObservabilityCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type ObservabilityCrdsProps = ChartProps &
	z.input<typeof ObservabilityCrdsConfigSchema>;

export * from "Observability/Crds/Crds";

export {
	ObservabilityCrds,
	ObservabilityCrdsBuilder,
	ObservabilityCrdsConfigError,
	ObservabilityCrdsConfigSchema,
};
