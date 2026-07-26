/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ChartConfigError } from "Commons/Config/ChartBuilder";
import type { UpstreamSource } from "Commons/Source";

import { Chart, type ChartProps, Include } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────

/** CRD toggle config — a map of `disable*` keys to booleans. */
export type Config = Record<string, boolean>;

/** Chart props merged with optional CRD toggle flags. */
export type CrdChartProps = ChartProps & Partial<Config>;

/** Declarative definition of a single CRD kind. */
export type KindDef = {
	file: string;
	disableKey: string;
	description: string;
};

/** Declarative definition of a CRD group (subset of kinds toggled together). */
export type GroupDef<K extends string> = {
	kinds: readonly K[];
	disableKey: string;
	description: string;
};

/** Combined definition of a single CRD kind and its upstream source. */
export type CrdKindSource = KindDef & { upstream: UpstreamSource };

/** Declarative definition of a CRD group with string-typed kind names. */
export type CrdGroupDef = {
	kinds: readonly string[];
	disableKey: string;
	description: string;
};

/** Discriminated union returned by the builder's `validate`. */
export type ValidationResult =
	| { success: true; config: Config }
	| { success: false; error: string };

/** Fluent builder — chain `enable()`/`disable()` calls then `build()`. */
export type CrdBuilderInstance<K extends string> = {
	enable(kind: K): CrdBuilderInstance<K>;
	disable(kind: K): CrdBuilderInstance<K>;
	enableAll(): CrdBuilderInstance<K>;
	disableAll(): CrdBuilderInstance<K>;
	build(): Chart;
};

/** Return value of {@link defineCrds}. */
export type DefineCrdsResult<K extends string> = {
	Chart: new (
		scope: Construct,
		id: string,
		props?: CrdChartProps,
	) => Chart & { config: Config };
	Builder: {
		create: (scope: Construct, id: string) => CrdBuilderInstance<K>;
		validate: (props: CrdChartProps) => ValidationResult;
	};
	ConfigSchema: z.ZodType;
	ConfigError: new (id: string, error: z.core.$ZodError) => ChartConfigError;
};

// ── Sources ───────────────────────────────────────────────────────────

/** Wraps a CRD source declaration and derives the per-file upstream mapping. */
export const defineCrdSources = <
	K extends string,
	G extends string = never,
>(sources: {
	kinds: Record<K, CrdKindSource>;
	groups?: Record<G, GroupDef<K>>;
}): {
	kinds: Record<K, CrdKindSource>;
	groups?: Record<G, GroupDef<K>>;
	upstream: Record<string, UpstreamSource>;
} => {
	const upstream = Object.fromEntries(
		(Object.values(sources.kinds) as CrdKindSource[]).map(
			(def) => [def.file, def.upstream] as const,
		),
	) as Record<string, UpstreamSource>;

	return { ...sources, upstream };
};

// ── Chart ─────────────────────────────────────────────────────────────

/**
 * Defines a complete CRD chart from declarative data.
 *
 * Generates a Zod config schema, error class, CDK8s chart class, and a fluent
 * builder. Supports enabling/disabling individual CRD kinds or groups of CRDs.
 */
export const defineCrds = <K extends string>(opts: {
	name: string;
	crdsDir: string;
	kinds: Record<K, { file: string; disableKey: string; description: string }>;
	groups?: Record<
		string,
		{ kinds: readonly K[]; disableKey: string; description: string }
	>;
}): DefineCrdsResult<K> => {
	const kindEntries = Object.entries(opts.kinds) as [K, KindDef][];
	const groupEntries = Object.entries(opts.groups ?? {}) as [
		string,
		GroupDef<K>,
	][];

	const configShape: Record<string, z.ZodDefault<z.ZodBoolean>> = {};
	for (const [, kind] of kindEntries) {
		configShape[kind.disableKey] = z
			.boolean()
			.describe(`Disable ${kind.description}`)
			.default(false);
	}
	for (const [groupName, group] of groupEntries) {
		configShape[group.disableKey] = z
			.boolean()
			.describe(`Disable ${groupName} group (${group.description})`)
			.default(false);
	}

	const configSchema = z.object(configShape);

	class ConfigError extends ChartConfigError {
		constructor(id: string, error: z.core.$ZodError) {
			super(opts.name, id, error);
			this.name = `${opts.name}ConfigError`;
		}
	}

	const getEnabled = (config: Config): string[] => {
		const enabled: string[] = [];
		for (const [, kind] of kindEntries) {
			if (config[kind.disableKey] !== true) {
				enabled.push(kind.file);
			}
		}
		return enabled;
	};

	class CrdChart extends Chart {
		readonly config: Config;

		constructor(scope: Construct, id: string, props?: CrdChartProps) {
			super(scope, id, props);
			const result = configSchema.safeParse(props ?? {});
			if (!result.success) {
				throw new ConfigError(id, result.error);
			}
			this.config = result.data as Config;

			for (const file of getEnabled(this.config)) {
				new Include(this, `${id}-${file}`, {
					url: `${opts.crdsDir}/${file}`,
				});
			}
		}
	}

	const createBuilder = (
		scope: Construct,
		id: string,
	): CrdBuilderInstance<K> => {
		const overrides: Record<string, boolean> = {};

		const builder: CrdBuilderInstance<K> = {
			enable: (kind: K) => {
				const kindDef = opts.kinds[kind];
				if (kindDef) overrides[kindDef.disableKey] = false;
				return builder;
			},
			disable: (kind: K) => {
				const kindDef = opts.kinds[kind];
				if (kindDef) overrides[kindDef.disableKey] = true;
				return builder;
			},
			enableAll: () => {
				for (const [, kind] of kindEntries) {
					overrides[kind.disableKey] = false;
				}
				return builder;
			},
			disableAll: () => {
				for (const [, kind] of kindEntries) {
					overrides[kind.disableKey] = true;
				}
				return builder;
			},
			build: () => {
				return new CrdChart(scope, id, overrides);
			},
		};

		return builder;
	};

	const validate = (props: CrdChartProps): ValidationResult => {
		const result = configSchema.safeParse(props);
		if (!result.success) {
			return {
				success: false as const,
				error: z.core.prettifyError(result.error),
			};
		}
		return { success: true as const, config: result.data as Config };
	};

	return {
		Chart: CrdChart as new (
			scope: Construct,
			id: string,
			props?: CrdChartProps,
		) => Chart & { config: Config },
		Builder: { create: createBuilder, validate },
		ConfigSchema: configSchema,
		ConfigError,
	};
};
