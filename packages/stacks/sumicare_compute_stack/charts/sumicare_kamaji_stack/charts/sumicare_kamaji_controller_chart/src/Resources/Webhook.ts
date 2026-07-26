/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates MutatingWebhookConfiguration and ValidatingWebhookConfiguration
 * resources for the Kamaji controller, wired to the webhook Service.
 * The CA bundle is self-patched by the controller on startup using the
 * CA certificate mounted from the SecretProviderClass-synced Secret.
 */
export class KamajiWebhook extends Construct {
	readonly mutatingWebhook: ApiObject;
	readonly validatingWebhook: ApiObject;

	constructor(scope: Construct, config: Config) {
		super(scope, "webhooks");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "controller",
		};

		const webhookServiceName = `${config.name}-webhook-service`;

		this.mutatingWebhook = new ApiObject(this, "mutating-webhook", {
			apiVersion: "admissionregistration.k8s.io/v1",
			kind: "MutatingWebhookConfiguration",
			metadata: {
				name: `${config.name}-mutating-webhook-configuration`,
				labels,
			},
			spec: {
				webhooks: [
					{
						admissionReviewVersions: ["v1"],
						clientConfig: {
							service: {
								name: webhookServiceName,
								namespace: config.namespace,
								path: "/mutate-kamaji-clastix-io-v1alpha1-tenantcontrolplane",
							},
						},
						failurePolicy: "Fail",
						name: "mtenantcontrolplane.kb.io",
						rules: [
							{
								apiGroups: ["kamaji.clastix.io"],
								apiVersions: ["v1alpha1"],
								operations: ["CREATE", "UPDATE"],
								resources: ["tenantcontrolplanes"],
							},
						],
						sideEffects: "None",
					},
				],
			},
		});

		this.validatingWebhook = new ApiObject(this, "validating-webhook", {
			apiVersion: "admissionregistration.k8s.io/v1",
			kind: "ValidatingWebhookConfiguration",
			metadata: {
				name: `${config.name}-validating-webhook-configuration`,
				labels,
			},
			spec: {
				webhooks: [
					{
						admissionReviewVersions: ["v1"],
						clientConfig: {
							service: {
								name: webhookServiceName,
								namespace: config.namespace,
								path: "/telemetry",
							},
						},
						failurePolicy: "Ignore",
						name: "telemetry.kamaji.clastix.io",
						rules: [
							{
								apiGroups: ["kamaji.clastix.io"],
								apiVersions: ["v1alpha1"],
								operations: ["CREATE", "UPDATE", "DELETE"],
								resources: ["tenantcontrolplanes"],
							},
						],
						sideEffects: "None",
					},
					{
						admissionReviewVersions: ["v1"],
						clientConfig: {
							service: {
								name: webhookServiceName,
								namespace: config.namespace,
								path: "/validate--v1-secret",
							},
						},
						failurePolicy: "Ignore",
						name: "vdatastoresecrets.kb.io",
						rules: [
							{
								apiGroups: [""],
								apiVersions: ["v1"],
								operations: ["DELETE"],
								resources: ["secrets"],
							},
						],
						sideEffects: "None",
					},
					{
						admissionReviewVersions: ["v1"],
						clientConfig: {
							service: {
								name: webhookServiceName,
								namespace: config.namespace,
								path: "/validate-kamaji-clastix-io-v1alpha1-datastore",
							},
						},
						failurePolicy: "Fail",
						name: "vdatastore.kb.io",
						rules: [
							{
								apiGroups: ["kamaji.clastix.io"],
								apiVersions: ["v1alpha1"],
								operations: ["CREATE", "UPDATE", "DELETE"],
								resources: ["datastores"],
							},
						],
						sideEffects: "None",
					},
					{
						admissionReviewVersions: ["v1"],
						clientConfig: {
							service: {
								name: webhookServiceName,
								namespace: config.namespace,
								path: "/validate-kamaji-clastix-io-v1alpha1-tenantcontrolplane",
							},
						},
						failurePolicy: "Fail",
						name: "vtenantcontrolplane.kb.io",
						rules: [
							{
								apiGroups: ["kamaji.clastix.io"],
								apiVersions: ["v1alpha1"],
								operations: ["CREATE", "UPDATE"],
								resources: ["tenantcontrolplanes"],
							},
						],
						sideEffects: "None",
					},
				],
			},
		});
	}
}
