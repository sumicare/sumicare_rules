/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Goldilocks/Dashboard/Config";
import {
	defineDeployment,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import {
	ConnectionScheme,
	type IServiceAccount,
	Protocol,
} from "cdk8s-plus-33";
import type { Construct } from "constructs";

type GoldilocksDashboardDeploymentProps = Config & {
	serviceAccount?: IServiceAccount;
};

const GoldilocksDashboardDeployments =
	defineDeployment<GoldilocksDashboardDeploymentProps>({
		deployments: (_scope, props) => {
			const healthPath = `${props.basePath ?? ""}/health`;
			return [
				{
					id: "dashboard-deployment",
					name: `${props.name}-dashboard`,
					component: "dashboard",
					replicas: props.replicas,
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
								"dashboard",
								`--exclude-containers=${props.excludeContainers}`,
								`-v${props.logVerbosity}`,
								...flagsToArgs(props.flags),
								...(props.basePath ? ["--base-path", props.basePath] : []),
							],
							ports: [{ number: 8080, name: "http", protocol: Protocol.TCP }],
							liveness: {
								path: healthPath,
								port: 8080,
								scheme: ConnectionScheme.HTTP,
							},
							readiness: {
								path: healthPath,
								port: 8080,
								scheme: ConnectionScheme.HTTP,
							},
							resources: props.resourceTier,
							securityContext: hardenedContainer({ runAsUser: 10324 }),
						},
					],
					nodeSelector: props.nodeSelector,
					tolerations: props.tolerations,
				},
			];
		},
	});

export type GoldilocksDashboardDeploymentConstruct = InstanceType<
	typeof GoldilocksDashboardDeployments
>;

export function createGoldilocksDashboardDeployment(
	scope: Construct,
	config: Config,
	sa: IServiceAccount | undefined,
): GoldilocksDashboardDeploymentConstruct {
	return new GoldilocksDashboardDeployments(scope, "deployment", {
		...config,
		serviceAccount: sa,
	});
}
