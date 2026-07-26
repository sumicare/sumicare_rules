/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates the MutatingWebhookConfiguration for the VPA admission controller.
 *
 * The webhook intercepts pod CREATE requests and VPA CREATE/UPDATE requests,
 * mutating pod resource requests based on VPA recommendations.
 */
export class VpaMutatingWebhook extends Construct {
	/** The MutatingWebhookConfiguration API object. */
	readonly webhook: ApiObject;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed VPA config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "mutating-webhook");

		this.webhook = new ApiObject(this, "mutating-webhook-config", {
			apiVersion: "admissionregistration.k8s.io/v1",
			kind: "MutatingWebhookConfiguration",
			metadata: {
				name: `${config.name}-webhook-config`,
				labels: {
					...commonLabels(config),
					"app.kubernetes.io/component": "admission-controller",
				},
			},
			webhooks: [
				{
					admissionReviewVersions: ["v1"],
					clientConfig: {
						service: {
							name: `${config.name}-webhook`,
							namespace: config.namespace,
							port: 443,
						},
					},
					failurePolicy: config.webhook.failurePolicy,
					matchPolicy: "Equivalent",
					name: "vpa.k8s.io",
					namespaceSelector: {},
					objectSelector: {},
					reinvocationPolicy: "Never",
					rules: [
						{
							apiGroups: [""],
							apiVersions: ["v1"],
							operations: ["CREATE"],
							resources: ["pods"],
							scope: "*",
						},
						{
							apiGroups: ["autoscaling.k8s.io"],
							apiVersions: ["*"],
							operations: ["CREATE", "UPDATE"],
							resources: ["verticalpodautoscalers"],
							scope: "*",
						},
					],
					sideEffects: "None",
					timeoutSeconds: config.webhook.timeoutSeconds,
				},
			],
		});
	}
}
