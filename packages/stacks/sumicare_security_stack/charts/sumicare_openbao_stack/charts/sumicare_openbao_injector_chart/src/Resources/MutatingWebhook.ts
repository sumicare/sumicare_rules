/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Openbao/Injector/Config";
import { commonLabels, componentLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

export class OpenbaoInjectorMutatingWebhook extends Construct {
	readonly webhook: ApiObject;

	constructor(scope: Construct, config: Config) {
		super(scope, "injector-webhook");

		const labels = {
			...commonLabels(config),
			...componentLabels(config.name, "injector"),
		};

		this.webhook = new ApiObject(this, "webhook", {
			apiVersion: "admissionregistration.k8s.io/v1",
			kind: "MutatingWebhookConfiguration",
			metadata: {
				name: `${config.name}-agent-injector-cfg`,
				namespace: config.namespace,
				labels,
			},
			webhooks: [
				{
					name: "openbao.org",
					sideEffects: "None",
					admissionReviewVersions: ["v1"],
					clientConfig: {
						service: {
							name: `${config.name}-agent-injector-svc`,
							namespace: config.namespace,
							path: "/mutate",
						},
						caBundle: "",
					},
					rules: [
						{
							operations: ["CREATE", "UPDATE"],
							apiGroups: [""],
							apiVersions: ["v1"],
							resources: ["pods"],
							scope: "Namespaced",
						},
					],
					namespaceSelector: {},
					objectSelector: {
						matchExpressions: [
							{
								key: "app.kubernetes.io/name",
								operator: "NotIn",
								values: [`${config.name}-agent-injector`],
							},
						],
					},
					failurePolicy: config.failurePolicy,
					matchPolicy: "Exact",
					timeoutSeconds: 30,
				},
			],
		});
	}
}
