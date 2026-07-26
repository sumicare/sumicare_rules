/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates PodDisruptionBudgets for the KEDA operator, metrics server,
 * and admission webhooks components. PDBs are only created when the
 * current environment is listed in `config.environments`.
 *
 * Uses `maxUnavailable = ceil(replicas / 2)` to allow rolling updates
 * while maintaining quorum.
 */
export class KedaPodDisruptionBudget extends Construct {
	/** The operator PDB. */
	readonly operatorPdb: ApiObject | undefined;
	/** The metrics server PDB, or undefined if not applicable. */
	readonly metricsServerPdb: ApiObject | undefined;
	/** The admission webhooks PDB, or undefined if not applicable. */
	readonly webhooksPdb: ApiObject | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed KEDA config.
	 * @param env - The current deployment environment (e.g. "prod", "staging").
	 */
	constructor(scope: Construct, config: Config, env: string) {
		super(scope, "poddisruptionbudgets");

		if (!config.environments.includes(env)) return;

		const labels = commonLabels(config);

		this.operatorPdb = new ApiObject(this, "operator-pdb", {
			apiVersion: "policy/v1",
			kind: "PodDisruptionBudget",
			metadata: {
				name: config.operator.name,
				namespace: config.namespace,
				labels,
			},
			spec: {
				maxUnavailable: Math.ceil(config.operator.replicas / 2),
				selector: {
					matchLabels: componentLabels(config.name, "operator"),
				},
			},
		});

		if (config.metricsServer.enabled) {
			this.metricsServerPdb = new ApiObject(this, "metrics-server-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: `${config.operator.name}-metrics-apiserver`,
					namespace: config.namespace,
					labels,
				},
				spec: {
					maxUnavailable: Math.ceil(config.metricsServer.replicas / 2),
					selector: {
						matchLabels: componentLabels(config.name, "metrics-server"),
					},
				},
			});
		}

		if (config.webhooks.enabled) {
			this.webhooksPdb = new ApiObject(this, "webhooks-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: config.webhooks.name,
					namespace: config.namespace,
					labels,
				},
				spec: {
					maxUnavailable: Math.ceil(config.webhooks.replicas / 2),
					selector: {
						matchLabels: componentLabels(config.name, "webhooks"),
					},
				},
			});
		}
	}
}
