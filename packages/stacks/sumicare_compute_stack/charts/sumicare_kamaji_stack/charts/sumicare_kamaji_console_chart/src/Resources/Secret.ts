/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Console/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { Secret } from "cdk8s-plus-33";
import { Construct } from "constructs";

/**
 * Creates the credentials Secret for the Kamaji Console, containing
 * NextAuth URL, JWT secret, admin credentials, and optional Sveltos
 * configuration. Only created when `credentialsSecret.generate` is true.
 */
export class ConsoleSecret extends Construct {
	readonly secret: Secret | undefined;

	constructor(scope: Construct, config: Config) {
		super(scope, "secret");

		if (!config.credentialsSecret.generate) {
			this.secret = undefined;
			return;
		}

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "console",
		};

		const stringData: Record<string, string> = {
			NEXTAUTH_URL: config.credentialsSecret.nextAuthUrl,
			JWT_SECRET: config.credentialsSecret.jwtSecret,
			ADMIN_EMAIL: config.credentialsSecret.email,
			ADMIN_PASSWORD: config.credentialsSecret.password,
			SVELTOS_URL: config.sveltos.url,
		};

		if (config.sveltos.namespace) {
			stringData.SVELTOS_NAMESPACE = config.sveltos.namespace;
		}
		if (config.sveltos.secretName) {
			stringData.SVELTOS_SECRET_NAME = config.sveltos.secretName;
		}

		this.secret = new Secret(this, "credentials", {
			metadata: {
				name: config.credentialsSecret.name,
				namespace: config.namespace,
				labels,
			},
			stringData,
		});
	}
}
