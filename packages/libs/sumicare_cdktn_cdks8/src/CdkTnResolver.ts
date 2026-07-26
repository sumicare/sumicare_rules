/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import {
	type CdkTnCliOutputConfig,
	createCdkTnCliOutput,
} from "CdkTnCdk8s/Output/CdkTnCliOutput";
import type { StackOutputs } from "CdkTnCdk8s/Output/StackOutputs";
import {
	createTofuOutput,
	type TofuOutputConfig,
} from "CdkTnCdk8s/Output/TofuOutput";
import type { ResolutionContext } from "cdk8s";
import type { App, ITerraformAddressable } from "cdktn";
import { TerraformOutput, TerraformStack, Token } from "cdktn";

export type { CdkTnCliOutputConfig, TofuOutputConfig };

type OutputIndex = Map<unknown, TerraformOutput>;

export const buildOutputIndex = (app: App) => {
	const stacks = app.node
		.findAll()
		.filter((c): c is TerraformStack => TerraformStack.isStack(c));
	const outputs = stacks.flatMap((stack) =>
		stack.node
			.findAll()
			.filter((c): c is TerraformOutput => c instanceof TerraformOutput),
	);
	const index = new Map<unknown, TerraformOutput>();
	for (const o of outputs) {
		if (!index.has(o.value)) index.set(o.value, o);
	}
	return index;
};

export const lookupOutput = (index: OutputIndex, value: unknown, app: App) => {
	const output = index.get(value);
	if (output) return output;
	throw new Error(
		`Unable to find output defined for ${value} (Inspected stacks: ${app.node
			.findAll()
			.filter((c): c is TerraformStack => TerraformStack.isStack(c))
			.map((s) => s.node.id)
			.join(",")})`,
	);
};

/** Props for {@link createCdkTnResolver}. */
export type CdkTnResolverProps = {
	readonly app: App;
	/** Custom fetch function. Takes precedence over `cdktnCli` and `tofuDirect`. */
	readonly fetchOutputsFn?: (app: App) => StackOutputs;
	/** CDKTN CLI config. Ignored when `fetchOutputsFn` or `tofuDirect` is provided. */
	readonly cdktnCli?: CdkTnCliOutputConfig;
	/** Direct `tofu output` config. Takes precedence over `cdktnCli`. */
	readonly tofuDirect?: TofuOutputConfig;
};

const resolveFetchOutput = (props: CdkTnResolverProps) => {
	if (props.fetchOutputsFn) return { fetch: props.fetchOutputsFn };
	if (props.tofuDirect) return createTofuOutput(props.tofuDirect);
	return createCdkTnCliOutput(props.cdktnCli);
};

/**
 * Creates a cdk8s resolver that resolves CDKTN `TerraformOutput` values
 * in cdk8s manifests. `cdk8s synth` must run *after* `cdktn deploy`.
 *
 * Supports three fetch strategies: CDKTN CLI (default), direct `tofu output`,
 * or a custom `fetchOutputsFn` for testing.
 */
export const createCdkTnResolver = (props: CdkTnResolverProps) => {
	const fetchOutput = resolveFetchOutput(props);
	let cached: StackOutputs | undefined;
	let index: OutputIndex | undefined;

	const resolve = (context: ResolutionContext) => {
		const isAddressable = (o: unknown): o is ITerraformAddressable =>
			typeof o === "object" && o !== null && !Array.isArray(o) && "fqn" in o;
		if (!Token.isUnresolved(context.value) && !isAddressable(context.value))
			return;

		if (!index) index = buildOutputIndex(props.app);
		const output = lookupOutput(index, context.value, props.app);

		try {
			if (!cached) cached = fetchOutput.fetch(props.app);
			context.replaceValue(
				cached[TerraformStack.of(output).node.id][output.friendlyUniqueId],
			);
		} catch (err) {
			context.replaceValue(
				`Failed fetching value for output ${output.node.path}: ${err}`,
			);
		}
	};

	return { resolve };
};
