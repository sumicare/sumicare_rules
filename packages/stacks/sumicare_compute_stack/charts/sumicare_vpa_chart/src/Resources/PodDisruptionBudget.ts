/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates PodDisruptionBudgets for the VPA recommender, updater, and
 * admission controller components. PDBs are only created when the
 * current environment is listed in `config.environments`.
 *
 * Uses `maxUnavailable = ceil(replicas / 2)` to allow rolling updates
 * while maintaining quorum.
 */
export class VpaPodDisruptionBudget extends Construct {
	/** The recommender PDB, or undefined if not applicable. */
	readonly recommenderPdb: ApiObject | undefined;
	/** The updater PDB, or undefined if not applicable. */
	readonly updaterPdb: ApiObject | undefined;
	/** The admission controller PDB, or undefined if not applicable. */
	readonly admissionControllerPdb: ApiObject | undefined;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed VPA config.
	 * @param env - The current deployment environment (e.g. "prod", "staging").
	 */
	constructor(scope: Construct, config: Config, env: string) {
		super(scope, "poddisruptionbudgets");

		if (!config.environments.includes(env)) return;

		const labels = commonLabels(config);

		if (config.recommender.enabled) {
			this.recommenderPdb = new ApiObject(this, "recommender-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: `${config.name}-recommender`,
					namespace: config.namespace,
					labels,
				},
				spec: {
					maxUnavailable: Math.ceil(config.recommender.replicas / 2),
					selector: {
						matchLabels: componentLabels(config.name, "recommender"),
					},
				},
			});
		}

		if (config.updater.enabled) {
			this.updaterPdb = new ApiObject(this, "updater-pdb", {
				apiVersion: "policy/v1",
				kind: "PodDisruptionBudget",
				metadata: {
					name: `${config.name}-updater`,
					namespace: config.namespace,
					labels,
				},
				spec: {
					maxUnavailable: Math.ceil(config.updater.replicas / 2),
					selector: {
						matchLabels: componentLabels(config.name, "updater"),
					},
				},
			});
		}

		if (config.admissionController.enabled) {
			this.admissionControllerPdb = new ApiObject(
				this,
				"admission-controller-pdb",
				{
					apiVersion: "policy/v1",
					kind: "PodDisruptionBudget",
					metadata: {
						name: `${config.name}-admission-controller`,
						namespace: config.namespace,
						labels,
					},
					spec: {
						maxUnavailable: Math.ceil(config.admissionController.replicas / 2),
						selector: {
							matchLabels: componentLabels(config.name, "admission-controller"),
						},
					},
				},
			);
		}
	}
}
