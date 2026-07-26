/**
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { Chart, type ChartProps } from "cdk8s";
import type { Construct } from "constructs";
import { z } from "zod";

type Config = Record<string, unknown>;

type ErrorCtor = new (id: string, error: z.core.$ZodError) => Error;

/** Fluent builder — chain `set()` calls then `build()`. */
export type ChartBuilderInstance<C extends Chart> = {
	set(key: string, value: unknown): ChartBuilderInstance<C>;
	build(): Promise<C>;
};

/** Error thrown when chart config fails Zod validation. */
export class ChartConfigError extends Error {
	readonly issues: readonly z.core.$ZodIssue[];

	constructor(chartName: string, id: string, error: z.core.$ZodError) {
		super(
			`${chartName} "${id}" has invalid config:\n${z.core.prettifyError(error)}`,
		);
		this.name = "ChartConfigError";
		this.issues = error.issues;
	}
}

/**
 * Creates a fluent builder factory for a CDK8s chart.
 *
 * The builder exposes `set(key, value)` for config options and `build()` for
 * async construction. When `version` is not explicitly set, it is auto-resolved
 * from the `latestVersion` promise. An optional `resolveConfig` transform is
 * applied to the parsed config (e.g. to inject a default image).
 */
export const createChartBuilder = <C extends Chart, P = Config>(opts: {
	chartCtor: new (scope: Construct, id: string, props: P) => C;
	configSchema: z.ZodTypeAny;
	latestVersion: Promise<string>;
	resolveConfig?: (parsed: Config) => Config;
}) => {
	const create = (scope: Construct, id: string): ChartBuilderInstance<C> => {
		const props: Config = {};
		const builder: ChartBuilderInstance<C> = {
			set: (key: string, value: unknown) => {
				props[key] = value;
				return builder;
			},
			build: async () => {
				if (props.version === undefined)
					props.version = await opts.latestVersion;
				return new opts.chartCtor(scope, id, props as P);
			},
		};
		return builder;
	};

	return { create };
};

/** Result of {@link defineChart}. */
export type DefineChartResult<C extends Chart, R, S extends z.ZodTypeAny> = {
	Chart: new (
		scope: Construct,
		id: string,
		props?: ChartProps & z.input<S>,
	) => C & {
		readonly config: R;
	};
	Builder: ReturnType<
		typeof createChartBuilder<
			C & { readonly config: R },
			ChartProps & z.input<S>
		>
	>;
};

/**
 * Defines a complete CDK8s chart from a declarative config and render function.
 *
 * Eliminates the repetitive parse/validate/resolveConfig/builder boilerplate
 * found in every chart. Returns a `Chart` class and a fluent `Builder`.
 *
 * @example
 * ```typescript
 * const { Chart: FooChart, Builder: FooChartBuilder } = defineChart({
 *   chartName: "FooChart",
 *   configSchema: FooConfigSchema,
 *   configError: FooConfigError,
 *   resolveConfig: fooConfig.resolveConfig,
 *   latestVersion: LatestFooVersion,
 *   render: (self, config) => {
 *     createFooRbac(self, config);
 *     createFooDeployment(self, config);
 *   },
 * });
 * ```
 */
export const defineChart = <
	S extends z.ZodTypeAny,
	E extends ErrorCtor,
	R = z.infer<S>,
>(opts: {
	chartName: string;
	configSchema: S;
	configError: E;
	resolveConfig?: (parsed: Config) => Config;
	latestVersion: Promise<string>;
	render: (self: Chart, config: R, props: ChartProps & z.input<S>) => void;
}): DefineChartResult<Chart, R, S> => {
	class DefinedChart extends Chart {
		readonly config: R;
		constructor(
			scope: Construct,
			id: string,
			props: ChartProps & z.input<S> = {} as ChartProps & z.input<S>,
		) {
			super(scope, id, props);
			const result = opts.configSchema.safeParse(props);
			if (!result.success) throw new opts.configError(id, result.error);
			this.config = (opts.resolveConfig ?? ((x: Config) => x))(
				result.data as Config,
			) as R;
			opts.render(this, this.config, props);
		}
	}

	const Builder = createChartBuilder({
		chartCtor: DefinedChart as unknown as new (
			scope: Construct,
			id: string,
			props: Config,
		) => DefinedChart,
		configSchema: opts.configSchema,
		latestVersion: opts.latestVersion,
		resolveConfig: opts.resolveConfig,
	});

	return {
		Chart: DefinedChart as new (
			scope: Construct,
			id: string,
			props?: ChartProps & z.input<S>,
		) => Chart & { readonly config: R },
		Builder,
	};
};
