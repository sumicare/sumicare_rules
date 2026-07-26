/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/KubeconfigGenerator/Config";
import {
	defineDeployment,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import { Protocol } from "cdk8s-plus-33";
import type { Construct } from "constructs";

const KamajiKubeconfigGeneratorDeployments = defineDeployment<Config>({
	deployments: (_scope, props) => {
		const args = [
			"kubeconfig-generator",
			`--metrics-bind-address=${props.metricsBindAddress}`,
			`--health-probe-bind-address=${props.healthProbeBindAddress}`,
			`--leader-elect=${props.enableLeaderElect}`,
			`--controller-reconcile-timeout=${props.controllerReconcileTimeout}`,
			`--cache-resync-period=${props.cacheResyncPeriod}`,
			`--certificate-expiration-deadline=${props.certificateExpirationDeadline}`,
		];
		if (props.loggingDevel) {
			args.push("--zap-devel");
		}
		args.push(...flagsToArgs(props.extraArgs));

		return [
			{
				id: "deployment",
				name: props.name,
				component: "kubeconfig-generator",
				replicas: props.replicas,
				containers: [
					{
						name: "controller",
						image: props.image,
						imagePullPolicy: props.imagePullPolicy,
						args,
						ports: [
							{ name: "healthcheck", number: 8091, protocol: Protocol.TCP },
						],
						resources: props.resourceTier,
						securityContext: hardenedContainer({ runAsUser: 65532 }),
					},
				],
				podSecurityContext: {
					runAsUser: 65532,
					runAsGroup: 65532,
					fsGroup: 65532,
				},
				nodeSelector: props.nodeSelector,
				tolerations: props.tolerations,
			},
		];
	},
});

export type KamajiKubeconfigGeneratorDeploymentConstruct = InstanceType<
	typeof KamajiKubeconfigGeneratorDeployments
>;

export function createKamajiKubeconfigGeneratorDeployment(
	scope: Construct,
	config: Config,
): KamajiKubeconfigGeneratorDeploymentConstruct {
	return new KamajiKubeconfigGeneratorDeployments(scope, "deployment", config);
}
