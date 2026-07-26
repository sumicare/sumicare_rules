/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Controller/Config";
import {
	defineDeployment,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import { type IServiceAccount, Protocol } from "cdk8s-plus-33";
import type { Construct } from "constructs";

type GoldilocksControllerDeploymentProps = Config & {
	serviceAccount?: IServiceAccount;
};

const GoldilocksControllerDeployments =
	defineDeployment<GoldilocksControllerDeploymentProps>({
		deployments: (_scope, props) => [
			{
				id: "controller-deployment",
				name: `${props.name}-controller`,
				component: "controller",
				replicas: 1,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.serviceAccount,
				automountServiceAccountToken: true,
				containers: [
					{
						name: "goldilocks",
						image: props.image,
						imagePullPolicy: props.imagePullPolicy,
						command: [
							"/goldilocks",
							"controller",
							`-v${props.logVerbosity}`,
							...flagsToArgs(props.flags),
						],
						ports: [{ number: 8080, name: "metrics", protocol: Protocol.TCP }],
						resources: props.resourceTier,
						securityContext: hardenedContainer({ runAsUser: 10324 }),
					},
				],
				nodeSelector: props.nodeSelector,
				tolerations: props.tolerations,
			},
		],
	});

export type GoldilocksControllerDeploymentConstruct = InstanceType<
	typeof GoldilocksControllerDeployments
>;

export function createGoldilocksControllerDeployment(
	scope: Construct,
	config: Config,
	sa: IServiceAccount | undefined,
): GoldilocksControllerDeploymentConstruct {
	return new GoldilocksControllerDeployments(scope, "deployment", {
		...config,
		serviceAccount: sa,
	});
}
