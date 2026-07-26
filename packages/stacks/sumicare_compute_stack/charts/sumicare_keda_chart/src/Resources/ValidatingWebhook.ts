/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

type WebhookRule = {
	apiGroups: string[];
	apiVersions: string[];
	operations: string[];
	resources: string[];
};

type WebhookDef = {
	name: string;
	path: string;
	rules: WebhookRule[];
};

const WEBHOOKS: WebhookDef[] = [
	{
		name: "vscaledobject.kb.io",
		path: "/validate-keda-sh-v1alpha1-scaledobject",
		rules: [
			{
				apiGroups: ["keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["scaledobjects"],
			},
		],
	},
	{
		name: "vscaledjob.kb.io",
		path: "/validate-keda-sh-v1alpha1-scaledjob",
		rules: [
			{
				apiGroups: ["keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["scaledjobs"],
			},
		],
	},
	{
		name: "vstriggerauthentication.kb.io",
		path: "/validate-keda-sh-v1alpha1-triggerauthentication",
		rules: [
			{
				apiGroups: ["keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["triggerauthentications"],
			},
		],
	},
	{
		name: "vsclustertriggerauthentication.kb.io",
		path: "/validate-keda-sh-v1alpha1-clustertriggerauthentication",
		rules: [
			{
				apiGroups: ["keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["clustertriggerauthentications"],
			},
		],
	},
	{
		name: "vcloudeventsource.kb.io",
		path: "/validate-eventing-keda-sh-v1alpha1-cloudeventsource",
		rules: [
			{
				apiGroups: ["eventing.keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["cloudeventsources"],
			},
		],
	},
	{
		name: "vclustercloudeventsource.kb.io",
		path: "/validate-eventing-keda-sh-v1alpha1-clustercloudeventsource",
		rules: [
			{
				apiGroups: ["eventing.keda.sh"],
				apiVersions: ["v1alpha1"],
				operations: ["CREATE", "UPDATE"],
				resources: ["clustercloudeventsources"],
			},
		],
	},
];

/**
 * Creates a ValidatingWebhookConfiguration for the KEDA admission
 * webhooks, covering scaledobjects, scaledjobs, triggerauthentications,
 * clustertriggerauthentications, cloudeventsources, and
 * clustercloudeventsources.
 */
export class KedaValidatingWebhook extends Construct {
	/** The CDK8s ValidatingWebhookConfiguration resource. */
	readonly webhook: ApiObject;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed KEDA config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "validating-webhook");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "webhooks",
		};

		this.webhook = new ApiObject(this, "validating-webhook-config", {
			apiVersion: "admissionregistration.k8s.io/v1",
			kind: "ValidatingWebhookConfiguration",
			metadata: {
				name: "keda-admission",
				labels,
			},
			webhooks: WEBHOOKS.map((w) => ({
				admissionReviewVersions: ["v1"],
				clientConfig: {
					service: {
						name: config.webhooks.name,
						namespace: config.namespace,
						path: w.path,
					},
				},
				failurePolicy: config.webhooks.failurePolicy,
				matchPolicy: "Equivalent",
				name: w.name,
				namespaceSelector: {},
				objectSelector: {},
				rules: w.rules,
				sideEffects: "None",
				timeoutSeconds: config.webhooks.timeoutSeconds,
			})),
		});
	}
}
