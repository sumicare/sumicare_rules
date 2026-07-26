/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { SecretsStoreCsiSecretProviderClass } from "@sumicare/stack-security-crds";
import { Construct } from "constructs";

/**
 * Creates a SecretProviderClass that uses the OpenBao CSI provider
 * to fetch TLS certificates from OpenBao's PKI secret engine for
 * the Kamaji webhook server, syncing them to a Kubernetes Secret.
 */
export class KamajiSecretProviderClass extends Construct {
	readonly secretName: string;

	constructor(scope: Construct, config: Config) {
		super(scope, "secret-provider-class");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "controller",
		};

		this.secretName = `${config.name}-webhook-server-cert`;

		const spc = config.secretProviderClass;
		const dnsNames = [
			`${config.name}-webhook-service.${config.namespace}.svc`,
			`${config.name}-webhook-service.${config.namespace}.svc.cluster.local`,
		];

		new SecretsStoreCsiSecretProviderClass(this, "webhook-spc", {
			metadata: {
				name: `${config.name}-webhook-spc`,
				namespace: config.namespace,
				labels,
			},
			spec: {
				provider: "openbao",
				parameters: {
					vaultAddress: spc.vaultAddress,
					vaultRole: spc.vaultRole,
					pkiPath: spc.pkiPath,
					commonName: dnsNames[0],
					altNames: dnsNames.join(","),
					ttl: spc.ttl,
				},
				secretObjects: [
					{
						secretName: this.secretName,
						type: "kubernetes.io/tls",
						data: [
							{ key: "tls.crt", objectName: "certificate" },
							{ key: "tls.key", objectName: "private_key" },
							{ key: "ca.crt", objectName: "issuing_ca" },
						],
					},
				],
			},
		});
	}
}
