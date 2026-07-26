/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Controller/Config";
import {
	defineDeployment,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import {
	ConnectionScheme,
	EmptyDirMedium,
	EnvFieldPaths,
	EnvValue,
	type IServiceAccount,
	Protocol,
	Secret,
	Volume,
} from "cdk8s-plus-33";
import type { Construct } from "constructs";

type KamajiDeploymentProps = Config & {
	serviceAccount: IServiceAccount;
	webhookCertSecretName: string;
};

const KamajiDeployments = defineDeployment<KamajiDeploymentProps>({
	deployments: (scope, props) => {
		const args = [
			"manager",
			`--metrics-bind-address=${props.metricsBindAddress}`,
			`--health-probe-bind-address=${props.healthProbeBindAddress}`,
			"--leader-elect",
			`--tmp-directory=${props.tmpDirectory}`,
			`--kine-image=${props.kineImage}`,
			`--max-concurrent-tcp-reconciles=${props.maxConcurrentReconciles}`,
			`--controller-reconcile-timeout=${props.controllerReconcileTimeout}`,
			`--cache-resync-period=${props.cacheResyncPeriod}`,
			`--certificate-expiration-deadline=${props.certificateExpirationDeadline}`,
			`--webhook-service-name=${props.webhookServiceName}`,
			`--webhook-ca-path=${props.webhookCaPath}`,
		];
		if (props.defaultDatastoreName) {
			args.push(`--datastore=${props.defaultDatastoreName}`);
		}
		if (props.telemetryDisabled) {
			args.push("--disable-telemetry");
		}
		if (props.loggingDevel) {
			args.push("--zap-devel");
		}
		if (props.pprofBindAddress) {
			args.push(`--pprof-bind-address=${props.pprofBindAddress}`);
		}
		if (props.migrateImage) {
			args.push(`--migrate-image=${props.migrateImage}`);
		}
		args.push(...flagsToArgs(props.extraArgs));

		const tmpVolume = Volume.fromEmptyDir(scope, "tmp-vol", "tmp", {
			medium: EmptyDirMedium.MEMORY,
		});
		const certVolume = Volume.fromSecret(
			scope,
			"cert-vol",
			Secret.fromSecretName(scope, "webhook-cert", props.webhookCertSecretName),
			{ name: "cert" },
		);

		return [
			{
				id: "controller-deployment",
				name: props.name,
				component: "controller",
				replicas: props.replicas,
				revisionHistoryLimit: props.revisionHistoryLimit,
				serviceAccount: props.serviceAccount,
				automountServiceAccountToken: true,
				containers: [
					{
						name: "manager",
						image: props.image,
						imagePullPolicy: props.imagePullPolicy,
						command: ["/kamaji"],
						args,
						ports: [
							{ name: "webhook-server", number: 9443, protocol: Protocol.TCP },
							{ name: "metrics", number: 8080, protocol: Protocol.TCP },
							{ name: "healthcheck", number: 8081, protocol: Protocol.TCP },
						],
						envVariables: {
							POD_NAMESPACE: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAMESPACE),
							SERVICE_ACCOUNT: EnvValue.fromFieldRef(
								EnvFieldPaths.SERVICE_ACCOUNT_NAME,
							),
						},
						resources: props.resourceTier,
						liveness: {
							path: "/healthz",
							port: 8081,
							scheme: ConnectionScheme.HTTP,
							initialDelaySeconds: props.livenessProbe.initialDelaySeconds,
							timeoutSeconds: props.livenessProbe.timeoutSeconds,
							periodSeconds: props.livenessProbe.periodSeconds,
							failureThreshold: props.livenessProbe.failureThreshold,
						},
						readiness: {
							path: "/readyz",
							port: 8081,
							scheme: ConnectionScheme.HTTP,
							initialDelaySeconds: props.readinessProbe.initialDelaySeconds,
							timeoutSeconds: props.readinessProbe.timeoutSeconds,
							periodSeconds: props.readinessProbe.periodSeconds,
							failureThreshold: props.readinessProbe.failureThreshold,
						},
						securityContext: hardenedContainer({ runAsUser: props.runAsUser }),
						volumeMounts: [
							{ volume: tmpVolume, path: "/tmp" },
							{
								volume: certVolume,
								path: "/tmp/k8s-webhook-server/serving-certs",
								readOnly: true,
							},
						],
					},
				],
				volumes: [tmpVolume, certVolume],
				priorityClassName: props.priorityClassName,
				terminationGracePeriodSeconds: 10,
				podSecurityContext: {
					runAsUser: props.runAsUser,
					runAsGroup: props.runAsGroup,
					fsGroup: props.fsGroup,
				},
				nodeSelector: props.nodeSelector,
				tolerations: props.tolerations,
			},
		];
	},
});

export type KamajiDeploymentConstruct = InstanceType<typeof KamajiDeployments>;

export function createKamajiDeployment(
	scope: Construct,
	config: Config,
	serviceAccount: IServiceAccount,
	webhookCertSecretName: string,
): KamajiDeploymentConstruct {
	return new KamajiDeployments(scope, "deployment", {
		...config,
		serviceAccount,
		webhookCertSecretName,
	});
}
