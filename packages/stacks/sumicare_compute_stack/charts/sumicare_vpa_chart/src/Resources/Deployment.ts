/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Vpa/Config";
import {
	defineDeployment,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import {
	EnvFieldPaths,
	EnvValue,
	type IServiceAccount,
	Secret,
	Volume,
} from "cdk8s-plus-33";
import type { Construct } from "constructs";

type VpaDeploymentProps = Config & {
	recommenderSa: IServiceAccount;
	updaterSa: IServiceAccount;
	admissionControllerSa: IServiceAccount;
};

function leaderElectArgs(config: Config, resourceName: string): string[] {
	return [
		"--leader-elect=true",
		`--leader-elect-resource-namespace=${config.namespace}`,
		`--leader-elect-resource-name=${resourceName}`,
		"--leader-elect-lease-duration=15s",
		"--leader-elect-renew-deadline=10s",
		"--leader-elect-retry-period=2s",
	];
}

const VpaDeployments = defineDeployment<VpaDeploymentProps>({
	deployments: (scope, props) => {
		const recommender = props.recommender;
		const updater = props.updater;
		const ac = props.admissionController;

		const acTlsSecretName =
			props.secretProviderClass.secretName ?? `${props.name}-tls-secret`;
		const acTlsSecret = Secret.fromSecretName(
			scope,
			"admission-controller-tls-secret",
			acTlsSecretName,
		);
		const acTlsVolume = Volume.fromSecret(
			scope,
			"admission-controller-tls-certs-volume",
			acTlsSecret,
			{ name: "tls-certs" },
		);

		return [
			{
				id: "recommender-deployment",
				name: `${props.name}-recommender`,
				component: "recommender",
				replicas: recommender.replicas,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.recommenderSa,
				automountServiceAccountToken: true,
				podSecurityContext: {
					runAsUser: props.runAsUser,
					runAsGroup: props.runAsGroup,
					fsGroup: props.fsGroup,
				},
				applyPodSeccomp: false,
				when: (p) => p.recommender.enabled,
				containers: [
					{
						name: "recommender",
						image: recommender.image,
						imagePullPolicy: recommender.imagePullPolicy,
						args: [
							...flagsToArgs(recommender.extraArgs),
							...(recommender.replicas > 1
								? leaderElectArgs(props, "vpa-recommender-lease")
								: []),
						],
						ports: [{ number: 8942, name: "metrics" }],
						envVariables: {
							NAMESPACE: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAMESPACE),
						},
						...(recommender.livenessProbe
							? { liveness: recommender.livenessProbe }
							: {}),
						...(recommender.readinessProbe
							? { readiness: recommender.readinessProbe }
							: {}),
						resources: recommender.resourceTier,
						securityContext: hardenedContainer(),
					},
				],
			},
			{
				id: "updater-deployment",
				name: `${props.name}-updater`,
				component: "updater",
				replicas: updater.replicas,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.updaterSa,
				automountServiceAccountToken: true,
				podSecurityContext: {
					runAsUser: props.runAsUser,
					runAsGroup: props.runAsGroup,
					fsGroup: props.fsGroup,
				},
				applyPodSeccomp: false,
				when: (p) => p.updater.enabled,
				containers: [
					{
						name: "updater",
						image: updater.image,
						imagePullPolicy: updater.imagePullPolicy,
						args: [
							...flagsToArgs(updater.extraArgs),
							...(updater.replicas > 1
								? leaderElectArgs(props, "vpa-updater-lease")
								: []),
						],
						ports: [{ number: 8943, name: "metrics" }],
						envVariables: {
							NAMESPACE: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAMESPACE),
						},
						...(updater.livenessProbe
							? { liveness: updater.livenessProbe }
							: {}),
						...(updater.readinessProbe
							? { readiness: updater.readinessProbe }
							: {}),
						resources: updater.resourceTier,
						securityContext: hardenedContainer(),
					},
				],
			},
			{
				id: "admission-controller-deployment",
				name: `${props.name}-admission-controller`,
				component: "admission-controller",
				replicas: ac.replicas,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.admissionControllerSa,
				automountServiceAccountToken: true,
				podSecurityContext: {
					runAsUser: props.runAsUser,
					runAsGroup: props.runAsGroup,
					fsGroup: props.fsGroup,
				},
				applyPodSeccomp: false,
				when: (p) => p.admissionController.enabled,
				containers: [
					{
						name: "admission-controller",
						image: ac.image,
						imagePullPolicy: ac.imagePullPolicy,
						args: [
							...flagsToArgs(ac.extraArgs),
							`--webhook-service=${props.name}-webhook`,
							`--port=${ac.httpPort}`,
							"--reload-cert=true",
						],
						ports: [
							{ number: ac.httpPort, name: "http" },
							{ number: ac.metricsPort, name: "metrics" },
						],
						envVariables: {
							NAMESPACE: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAMESPACE),
						},
						...(ac.livenessProbe ? { liveness: ac.livenessProbe } : {}),
						...(ac.readinessProbe ? { readiness: ac.readinessProbe } : {}),
						resources: ac.resourceTier,
						securityContext: hardenedContainer(),
						volumeMounts: [
							{ volume: acTlsVolume, path: "/etc/tls-certs", readOnly: true },
						],
					},
				],
				volumes: [acTlsVolume],
				hostNetwork: ac.useHostNetwork,
			},
		];
	},
});

export type VpaDeploymentConstruct = InstanceType<typeof VpaDeployments>;

export function createVpaDeployment(
	scope: Construct,
	config: Config,
	recommenderSa: IServiceAccount,
	updaterSa: IServiceAccount,
	admissionControllerSa: IServiceAccount,
): VpaDeploymentConstruct {
	return new VpaDeployments(scope, "deployments", {
		...config,
		recommenderSa,
		updaterSa,
		admissionControllerSa,
	});
}
