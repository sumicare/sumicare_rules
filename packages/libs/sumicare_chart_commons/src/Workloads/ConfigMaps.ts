/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { ChartConfigError } from "Commons/Config/ChartBuilder";
import { commonLabels, componentLabels } from "Commons/Workloads/Labels";

import { ApiObject, type JsonPatch } from "cdk8s";
import { ConfigMap } from "cdk8s-plus-33";
import { Construct } from "constructs";
import type { z } from "zod";

type Config = Record<string, unknown> & {
	name: string;
	namespace: string;
	version: string;
};

type ErrorCtor = new (id: string, error: z.core.$ZodError) => Error;

/** Declarative definition for a ConfigMap. */
export type ConfigMapDef<C extends Config = Config> = {
	component?: string;
	name: string | ((config: C) => string);
	dataSchema: z.ZodTypeAny;
	map: (config: C) => Record<string, string>;
	patches?: JsonPatch[] | ((config: C) => JsonPatch[]);
};

export type ConfigMapConstruct = Construct & {
	readonly configMap: ConfigMap;
};

export const defineConfigMap = <C extends Config = Config>(
	def: ConfigMapDef<C>,
	ErrorClass?: ErrorCtor,
): (new (
	scope: Construct,
	config: C,
) => ConfigMapConstruct) => {
	const Err =
		ErrorClass ??
		class extends ChartConfigError {
			constructor(id: string, error: z.core.$ZodError) {
				super("ConfigMap", id, error);
			}
		};
	return class extends Construct {
		readonly configMap: ConfigMap;
		constructor(scope: Construct, config: C) {
			const id = typeof def.name === "function" ? def.name(config) : def.name;
			super(scope, id);

			const data = def.map(config);
			const result = def.dataSchema.safeParse(data);
			if (!result.success) throw new Err(id, result.error);

			const labels = {
				...commonLabels(config),
				...(def.component ? componentLabels(config.name, def.component) : {}),
			};

			this.configMap = new ConfigMap(this, "configmap", {
				metadata: { name: id, namespace: config.namespace, labels },
				data: result.data as Record<string, string>,
			});

			const patches =
				typeof def.patches === "function" ? def.patches(config) : def.patches;
			if (patches) ApiObject.of(this.configMap).addJsonPatch(...patches);
		}
	} as new (
		scope: Construct,
		config: C,
	) => ConfigMapConstruct;
};
