/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Security/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: SecurityCrds,
	Builder: SecurityCrdsBuilder,
	ConfigSchema: SecurityCrdsConfigSchema,
	ConfigError: SecurityCrdsConfigError,
} = defineCrds({
	name: "SecurityCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link SecurityCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type SecurityCrdsProps = ChartProps &
	z.input<typeof SecurityCrdsConfigSchema>;

export * from "Security/Crds/Crds";

export {
	SecurityCrds,
	SecurityCrdsBuilder,
	SecurityCrdsConfigError,
	SecurityCrdsConfigSchema,
};
