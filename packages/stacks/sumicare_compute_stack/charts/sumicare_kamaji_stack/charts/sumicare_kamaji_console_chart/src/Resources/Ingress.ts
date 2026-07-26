/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Console/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates an optional Ingress for the Kamaji Console UI.
 * Only created when `ingress.enabled` is true.
 */
export class ConsoleIngress extends Construct {
	readonly ingress: ApiObject | undefined;

	constructor(scope: Construct, config: Config, serviceName: string) {
		super(scope, "ingress");

		if (!config.ingress.enabled) {
			this.ingress = undefined;
			return;
		}

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "console",
		};

		const annotations: Record<string, string> = {
			...config.ingress.annotations,
		};
		if (config.ingress.className) {
			annotations["kubernetes.io/ingress.class"] = config.ingress.className;
		}

		const tls =
			config.ingress.tls.length > 0
				? config.ingress.tls.map((t) => ({
						secretName: t.secretName,
						hosts: t.hosts,
					}))
				: undefined;

		this.ingress = new ApiObject(this, "console-ingress", {
			apiVersion: "networking.k8s.io/v1",
			kind: "Ingress",
			metadata: {
				name: config.name,
				namespace: config.namespace,
				labels,
				annotations,
			},
			spec: {
				rules: config.ingress.hosts.map((h) => ({
					host: h.host,
					http: {
						paths: [
							{
								path: h.path,
								pathType: h.pathType,
								backend: {
									service: {
										name: serviceName,
										port: {
											name: "http",
										},
									},
								},
							},
						],
					},
				})),
				...(tls ? { tls } : {}),
			},
		});
	}
}
