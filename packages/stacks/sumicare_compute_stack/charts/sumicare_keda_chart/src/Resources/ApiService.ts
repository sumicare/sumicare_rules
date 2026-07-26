/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Keda/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates an APIService resource for the KEDA external metrics API,
 * registering v1beta1.external.metrics.k8s.io with the Kubernetes
 * API aggregator backed by the KEDA metrics server service.
 */
export class KedaApiService extends Construct {
	/** The CDK8s APIService resource. */
	readonly apiService: ApiObject;

	/**
	 * @param scope - The CDK8s construct scope.
	 * @param config - The parsed KEDA config.
	 */
	constructor(scope: Construct, config: Config) {
		super(scope, "api-service");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "metrics-server",
		};

		this.apiService = new ApiObject(this, "external-metrics-api", {
			apiVersion: "apiregistration.k8s.io/v1",
			kind: "APIService",
			metadata: {
				name: "v1beta1.external.metrics.k8s.io",
				labels,
			},
			spec: {
				service: {
					name: `${config.operator.name}-metrics-apiserver`,
					namespace: config.namespace,
					port: config.service.portHttps,
				},
				group: "external.metrics.k8s.io",
				version: "v1beta1",
				groupPriorityMinimum: 100,
				versionPriority: 100,
			},
		});
	}
}
