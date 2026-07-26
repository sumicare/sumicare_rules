/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Gitops/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: GitopsCrds,
	Builder: GitopsCrdsBuilder,
	ConfigSchema: GitopsCrdsConfigSchema,
	ConfigError: GitopsCrdsConfigError,
} = defineCrds({
	name: "GitopsCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link GitopsCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type GitopsCrdsProps = ChartProps &
	z.input<typeof GitopsCrdsConfigSchema>;

export * from "Gitops/Crds/Crds";

export {
	GitopsCrds,
	GitopsCrdsBuilder,
	GitopsCrdsConfigError,
	GitopsCrdsConfigSchema,
};
