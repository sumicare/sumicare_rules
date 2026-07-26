/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates a PodDisruptionBudget for the Kamaji controller.
 * PDBs are only created when the current environment is listed
 * in `config.environments`.
 */
export class KamajiPodDisruptionBudget extends Construct {
	readonly pdb: ApiObject | undefined;

	constructor(scope: Construct, config: Config, env: string) {
		super(scope, "poddisruptionbudget");

		if (!config.environments.includes(env)) {
			this.pdb = undefined;
			return;
		}

		this.pdb = new ApiObject(this, "controller-pdb", {
			apiVersion: "policy/v1",
			kind: "PodDisruptionBudget",
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels: commonLabels(config),
			},
			spec: {
				maxUnavailable: Math.ceil(config.replicas / 2),
				selector: {
					matchLabels: componentLabels(config.name, "controller"),
				},
			},
		});
	}
}
