/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Openbao/Injector/Config";
import { defineDeployment, hardenedContainer } from "@sumicare/chart-commons";
import { JsonPatch } from "cdk8s";
import { ConnectionScheme, type IServiceAccount } from "cdk8s-plus-33";
import type { Construct } from "constructs";

type OpenbaoInjectorDeploymentProps = Config & {
	serviceAccount: IServiceAccount;
};

const OpenbaoInjectorDeployments =
	defineDeployment<OpenbaoInjectorDeploymentProps>({
		deployments: (_scope, props) => {
			const useLeaderElector =
				props.leaderElector.enabled && props.replicas > 1;

			const envEntries: Record<string, unknown>[] = [
				{ name: "AGENT_INJECT_LISTEN", value: `:${props.port}` },
				{ name: "AGENT_INJECT_LOG_LEVEL", value: props.logLevel },
				{ name: "AGENT_INJECT_LOG_FORMAT", value: props.logFormat },
				{
					name: "AGENT_INJECT_VAULT_ADDR",
					value: `https://${props.name}.${props.namespace}.svc:8200`,
				},
				{
					name: "AGENT_INJECT_VAULT_AUTH_PATH",
					value: props.authPath,
				},
				{
					name: "AGENT_INJECT_VAULT_IMAGE",
					value: props.agentImage,
				},
				...(props.certs.secretName
					? [
							{
								name: "AGENT_INJECT_TLS_CERT_FILE",
								value: `/etc/webhook/certs/${props.certs.certName}`,
							},
							{
								name: "AGENT_INJECT_TLS_KEY_FILE",
								value: `/etc/webhook/certs/${props.certs.keyName}`,
							},
						]
					: [
							{
								name: "AGENT_INJECT_TLS_AUTO",
								value: `${props.name}-agent-injector-cfg`,
							},
							{
								name: "AGENT_INJECT_TLS_AUTO_HOSTS",
								value: `${props.name}-agent-injector-svc,${props.name}-agent-injector-svc.${props.namespace},${props.name}-agent-injector-svc.${props.namespace}.svc`,
							},
						]),
				{
					name: "AGENT_INJECT_REVOKE_ON_SHUTDOWN",
					value: `${props.revokeOnShutdown}`,
				},
				...(props.metrics.enabled
					? [{ name: "AGENT_INJECT_TELEMETRY_PATH", value: "/metrics" }]
					: []),
				...(useLeaderElector
					? [
							{ name: "AGENT_INJECT_USE_LEADER_ELECTOR", value: "true" },
							{
								name: "NAMESPACE",
								valueFrom: {
									fieldRef: { fieldPath: "metadata.namespace" },
								},
							},
						]
					: []),
				{
					name: "AGENT_INJECT_CPU_REQUEST",
					value: props.agentDefaults.cpuRequest,
				},
				{ name: "AGENT_INJECT_CPU_LIMIT", value: props.agentDefaults.cpuLimit },
				{
					name: "AGENT_INJECT_MEM_REQUEST",
					value: props.agentDefaults.memRequest,
				},
				{ name: "AGENT_INJECT_MEM_LIMIT", value: props.agentDefaults.memLimit },
				...(props.agentDefaults.ephemeralRequest
					? [
							{
								name: "AGENT_INJECT_EPHEMERAL_REQUEST",
								value: props.agentDefaults.ephemeralRequest,
							},
						]
					: []),
				...(props.agentDefaults.ephemeralLimit
					? [
							{
								name: "AGENT_INJECT_EPHEMERAL_LIMIT",
								value: props.agentDefaults.ephemeralLimit,
							},
						]
					: []),
				{
					name: "AGENT_INJECT_DEFAULT_TEMPLATE",
					value: props.agentDefaults.template,
				},
				{
					name: "AGENT_INJECT_TEMPLATE_CONFIG_EXIT_ON_RETRY_FAILURE",
					value: `${props.agentDefaults.templateConfig.exitOnRetryFailure}`,
				},
				...(props.agentDefaults.templateConfig.staticSecretRenderInterval
					? [
							{
								name: "AGENT_INJECT_TEMPLATE_STATIC_SECRET_RENDER_INTERVAL",
								value:
									props.agentDefaults.templateConfig.staticSecretRenderInterval,
							},
						]
					: []),
				{
					name: "POD_NAME",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
			];

			const patches: JsonPatch[] = [
				JsonPatch.add("/spec/template/spec/containers/0/env", envEntries),
				JsonPatch.add("/spec/template/spec/containers/0/startupProbe", {
					httpGet: {
						path: "/health/ready",
						port: props.port,
						scheme: "HTTPS",
					},
					failureThreshold: props.startupProbe.failureThreshold,
					initialDelaySeconds: props.startupProbe.initialDelaySeconds,
					periodSeconds: props.startupProbe.periodSeconds,
					successThreshold: props.startupProbe.successThreshold,
					timeoutSeconds: props.startupProbe.timeoutSeconds,
				}),
			];

			if (props.certs.secretName) {
				patches.push(
					JsonPatch.add("/spec/template/spec/containers/0/volumeMounts", [
						{
							name: "webhook-certs",
							mountPath: "/etc/webhook/certs",
							readOnly: true,
						},
					]),
					JsonPatch.add("/spec/template/spec/volumes", [
						{
							name: "webhook-certs",
							secret: { secretName: props.certs.secretName },
						},
					]),
				);
			}

			return [
				{
					id: "deploy",
					name: `${props.name}-agent-injector`,
					component: "injector",
					replicas: props.replicas,
					revisionHistoryLimit: props.revisionHistoryLimit,
					serviceAccount: props.serviceAccount,
					podSecurityContext: {
						runAsUser: props.runAsUser,
						runAsGroup: props.runAsGroup,
						fsGroup: props.fsGroup,
					},
					containers: [
						{
							name: "sidecar-injector",
							image: props.image,
							imagePullPolicy: props.imagePullPolicy,
							args: ["agent-inject", "2>&1"],
							resources: props.resourceTier,
							liveness: {
								path: "/health/ready",
								port: props.port,
								scheme: ConnectionScheme.HTTPS,
								...props.livenessProbe,
							},
							readiness: {
								path: "/health/ready",
								port: props.port,
								scheme: ConnectionScheme.HTTPS,
								...props.readinessProbe,
							},
							securityContext: hardenedContainer(),
						},
					],
					hostNetwork: props.hostNetwork || undefined,
					priorityClassName: props.priorityClassName,
					extraPatches: patches,
				},
			];
		},
	});

export type OpenbaoInjectorDeploymentConstruct = InstanceType<
	typeof OpenbaoInjectorDeployments
>;

export function createOpenbaoInjectorDeployment(
	scope: Construct,
	config: Config,
	serviceAccount: IServiceAccount,
): OpenbaoInjectorDeploymentConstruct {
	return new OpenbaoInjectorDeployments(scope, "injector-deployment", {
		...config,
		serviceAccount,
	});
}
