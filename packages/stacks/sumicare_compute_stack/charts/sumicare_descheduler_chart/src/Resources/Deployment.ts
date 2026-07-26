/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Compute/Descheduler/Config";
import {
	type DeploymentDef,
	defineDeployment,
	hardenedContainer,
} from "@sumicare/chart-commons";
import { type ConfigMap, ConnectionScheme, Volume } from "cdk8s-plus-33";
import type { Construct } from "constructs";

type DeschedulerDeploymentProps = Config & {
	serviceAccount: import("cdk8s-plus-33").IServiceAccount;
	configMap: ConfigMap;
};

function argsFrom(config: Config): string[] {
	const gates = Object.entries(config.featureGates)
		.filter(([, v]) => v)
		.map(([k]) => `${k}=true`)
		.join(",");
	return [
		"--policy-config-file=/policy-dir/policy.yaml",
		`--descheduling-interval=${config.deschedulingInterval}`,
		`--v=${config.logVerbosity}`,
		...(config.leaderElection.enabled
			? [
					"--leader-elect=true",
					`--leader-elect-lease-duration=${config.leaderElection.leaseDuration}`,
					`--leader-elect-renew-deadline=${config.leaderElection.renewDeadline}`,
					`--leader-elect-retry-period=${config.leaderElection.retryPeriod}`,
					`--leader-elect-resource-lock=${config.leaderElection.resourceLock}`,
					`--leader-elect-resource-name=${config.leaderElection.resourceName}`,
					`--leader-elect-resource-namespace=${config.leaderElection.resourceNamespace}`,
				]
			: []),
		...(config.dryRun ? ["--dry-run=true"] : []),
		...(config.disableMetrics ? ["--disable-metrics=true"] : []),
		...(config.enableHTTP2 ? ["--enable-http2=true"] : []),
		`--otel-collector-endpoint=${config.tracing.collectorEndpoint}`,
		...(config.tracing.transportCert
			? [`--otel-transport-ca-cert=${config.tracing.transportCert}`]
			: []),
		`--otel-service-name=${config.name}`,
		`--otel-trace-namespace=${config.namespace}`,
		`--otel-sample-rate=${config.tracing.sampleRate}`,
		...(config.tracing.fallbackToNoOpProviderOnError
			? ["--otel-fallback-no-op-on-error=true"]
			: []),
		...(gates ? [`--feature-gates=${gates}`] : []),
		...(config.clientConnection.qps !== undefined
			? [`--client-connection-qps=${config.clientConnection.qps}`]
			: []),
		...(config.clientConnection.burst !== undefined
			? [`--client-connection-burst=${config.clientConnection.burst}`]
			: []),
	];
}

const DeschedulerDeployments = defineDeployment<DeschedulerDeploymentProps>({
	deployments: (scope, props) => {
		const policyVolume = Volume.fromConfigMap(
			scope,
			"policy-volume",
			props.configMap,
			{ name: "policy-volume" },
		);

		return [
			{
				id: "deployment",
				name: props.name,
				replicas: props.replicas,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.serviceAccount,
				automountServiceAccountToken: true,
				podSecurityContext: {
					runAsUser: props.runAsUser,
					runAsGroup: props.runAsGroup,
					fsGroup: props.fsGroup,
					ensureNonRoot: true,
				},
				podAnnotations: { "checksum/config": props.configMap.name },
				applyPodSeccomp: false,
				containers: [
					{
						name: props.name,
						image: props.image,
						imagePullPolicy: "IfNotPresent",
						command: ["/bin/descheduler"],
						args: argsFrom(props),
						ports: [
							{
								number: props.metricsPort,
								name: "https-metrics",
							},
						],
						liveness: {
							path: "/healthz",
							port: props.metricsPort,
							scheme: ConnectionScheme.HTTPS,
							initialDelaySeconds: 30,
							timeoutSeconds: 5,
							periodSeconds: 10,
							successThreshold: 1,
							failureThreshold: 3,
						},
						resources: props.resourceTier,
						securityContext: hardenedContainer(),
						volumeMounts: [{ volume: policyVolume, path: "/policy-dir" }],
					},
				],
				volumes: [policyVolume],
				priorityClassName: props.priorityClassName,
			} satisfies DeploymentDef<DeschedulerDeploymentProps>,
		];
	},
});

export type DeschedulerDeploymentConstruct = InstanceType<
	typeof DeschedulerDeployments
>;

export function createDeschedulerDeployment(
	scope: Construct,
	config: Config,
	serviceAccount: import("cdk8s-plus-33").IServiceAccount,
	configMap: ConfigMap,
): DeschedulerDeploymentConstruct {
	return new DeschedulerDeployments(scope, "deployment", {
		...config,
		serviceAccount,
		configMap,
	});
}
