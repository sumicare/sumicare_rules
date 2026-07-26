/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { CRD_SOURCES } from "Networking/Crds/CrdSources";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineCrds } from "@sumicare/chart-commons";

import type { ChartProps } from "cdk8s";
import type { z } from "zod";

const dir = dirname(fileURLToPath(import.meta.url));

const {
	Chart: NetworkingCrds,
	Builder: NetworkingCrdsBuilder,
	ConfigSchema: NetworkingCrdsConfigSchema,
	ConfigError: NetworkingCrdsConfigError,
} = defineCrds({
	name: "NetworkingCrds",
	crdsDir: join(dir, "..", "crds"),
	kinds: CRD_SOURCES.kinds,
	groups: CRD_SOURCES.groups,
});

/** Props for {@link NetworkingCrds}. Combines CDK8s {@link ChartProps} with CRD enable/disable flags. */
export type NetworkingCrdsProps = ChartProps &
	z.input<typeof NetworkingCrdsConfigSchema>;

export * from "Networking/Crds/Crds";

export {
	NetworkingCrds,
	NetworkingCrdsBuilder,
	NetworkingCrdsConfigError,
	NetworkingCrdsConfigSchema,
};
