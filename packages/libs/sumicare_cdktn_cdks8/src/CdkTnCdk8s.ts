/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { manifest, provider } from "@cdktn/provider-kubernetes";
import type { App } from "cdk8s";
import { Aspects } from "cdktn";
import type { Construct, IConstruct } from "constructs";
import * as yaml from "yaml";

export type Cdk8sProviderConfig = provider.KubernetesProviderConfig & {
	readonly cdk8sApp: App;
};

type K8sManifest = {
	readonly apiVersion: string;
	readonly kind: string;
	readonly metadata: {
		readonly name?: string;
		readonly generateName?: string;
		readonly namespace?: string;
	};
};

export const escapeTerraformInterpolation = (value: unknown): unknown => {
	if (typeof value === "string") {
		return value.replace(/\n/g, "\\n").replace(/\${/g, "$$${");
	}
	if (Array.isArray(value)) {
		return value.map(escapeTerraformInterpolation);
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([k, v]) => [
				k,
				escapeTerraformInterpolation(v),
			]),
		);
	}
	return value;
};

export const manifestId = (
	id: string,
	{ apiVersion, kind, metadata }: K8sManifest,
) => {
	const type = `${apiVersion}-${kind}`;
	const namespace = metadata?.namespace ?? "default";
	const name = metadata?.name ?? metadata?.generateName ?? "unnamed";
	return `${id}-${type}-${name}-${namespace}`;
};

export const parseManifests = (yamlStr: string): K8sManifest[] =>
	yaml
		.parseAllDocuments(yamlStr)
		.map((doc) => doc.toJSON())
		.filter(
			(m): m is K8sManifest =>
				m !== null && typeof m === "object" && "apiVersion" in m && "kind" in m,
		);

/**
 * Creates a CDKTN `KubernetesProvider` that converts cdk8s manifests into
 * CDKTN `kubernetes_manifest` resources. The provider registers an `Aspects`
 * visitor that runs once during synthesis, parsing the cdk8s app's YAML output
 * and creating a `Manifest` resource for each document.
 */
export const createCdk8sProvider = ({
	scope,
	id,
	config,
}: {
	readonly scope: Construct;
	readonly id: string;
	readonly config: Cdk8sProviderConfig;
}) => {
	const k8sProvider = new provider.KubernetesProvider(scope, id, config);
	k8sProvider.alias = `cdktn-cdk8s-${id}`;

	Aspects.of(scope).add({
		visit: (node: IConstruct) => {
			if (node !== k8sProvider) return;

			for (const m of parseManifests(config.cdk8sApp.synthYaml())) {
				new manifest.Manifest(k8sProvider, manifestId(id, m), {
					provider: k8sProvider,
					manifest: escapeTerraformInterpolation(m) as Record<string, any>,
				});
			}
		},
	});

	return k8sProvider;
};
