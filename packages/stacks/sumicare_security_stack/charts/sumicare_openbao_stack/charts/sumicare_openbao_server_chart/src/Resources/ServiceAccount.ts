/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { ServerConfig } from "Openbao/Server/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { ApiObject, JsonPatch } from "cdk8s";
import { Secret } from "cdk8s-plus-33";
import { Construct } from "constructs";

export class OpenbaoServerServiceAccount extends Construct {
	readonly tokenSecret: Secret;

	constructor(scope: Construct, config: ServerConfig) {
		super(scope, "server-sa");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "server"),
		};

		this.tokenSecret = new Secret(this, "token", {
			metadata: {
				name: `${config.name}-server-token`,
				namespace: config.namespace,
				labels,
				annotations: {
					"kubernetes.io/service-account.name": `${config.name}-server`,
				},
			},
			type: "kubernetes.io/service-account-token",
		});

		ApiObject.of(this.tokenSecret).addJsonPatch(
			JsonPatch.add(
				"/metadata/annotations/kubernetes.io/service-account.name",
				`${config.name}-server`,
			),
		);
	}
}
