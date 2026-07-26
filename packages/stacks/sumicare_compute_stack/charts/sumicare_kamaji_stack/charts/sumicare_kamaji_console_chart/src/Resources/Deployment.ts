/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Console/Config";
import { defineDeployment, hardenedContainer } from "@sumicare/chart-commons";
import { Env, type IServiceAccount, Protocol, Secret } from "cdk8s-plus-33";
import type { Construct } from "constructs";

type ConsoleDeploymentProps = Config & {
	serviceAccount: IServiceAccount;
};

const ConsoleDeployments = defineDeployment<ConsoleDeploymentProps>({
	deployments: (scope, props) => [
		{
			id: "console-deployment",
			name: props.name,
			component: "console",
			replicas: props.replicas,
			serviceAccount: props.serviceAccount,
			automountServiceAccountToken: true,
			containers: [
				{
					name: "kamaji-console",
					image: props.image,
					imagePullPolicy: props.imagePullPolicy,
					ports: [{ name: "http", number: 3000, protocol: Protocol.TCP }],
					resources: props.resourceTier,
					securityContext: hardenedContainer({ runAsUser: 1001 }),
					envFrom: [
						Env.fromSecret(
							Secret.fromSecretName(
								scope,
								"credentials-ref",
								props.credentialsSecret.name,
							),
						),
					],
				},
			],
			podSecurityContext: {
				runAsUser: 1001,
				runAsGroup: 1001,
				fsGroup: 1001,
			},
			nodeSelector: props.nodeSelector,
			tolerations: props.tolerations,
		},
	],
});

export type ConsoleDeploymentConstruct = InstanceType<
	typeof ConsoleDeployments
>;

export function createConsoleDeployment(
	scope: Construct,
	config: Config,
	serviceAccount: IServiceAccount,
): ConsoleDeploymentConstruct {
	return new ConsoleDeployments(scope, "deployment", {
		...config,
		serviceAccount,
	});
}
