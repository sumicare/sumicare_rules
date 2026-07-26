/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { CsiConfig } from "Openbao/Csi/Config";
import {
	type ContainerDef,
	type DaemonSetDef,
	defineDaemonSet,
	flagsToArgs,
	hardenedContainer,
} from "@sumicare/chart-commons";
import { JsonPatch } from "cdk8s";
import type { Construct } from "constructs";

export class OpenbaoCsiDaemonSet extends defineDaemonSet<CsiConfig>({
	daemonSets: (_scope, config) => {
		const containers: ContainerDef[] = [
			{
				name: `${config.name}-csi-provider`,
				image: `${config.image}:v${config.version}`,
				imagePullPolicy: config.imagePullPolicy as
					| "Always"
					| "IfNotPresent"
					| "Never"
					| undefined,
				args: [
					`--endpoint=${config.endpoint}`,
					`--debug=${config.debug}`,
					`--hmac-secret-name=${config.hmacSecretName}`,
					...(config.openbaoMount
						? [`--openbao-mount=${config.openbaoMount}`]
						: []),
					...(config.openbaoNamespace
						? [`--openbao-namespace=${config.openbaoNamespace}`]
						: []),
					`--cache-size=${config.cacheSize}`,
					...flagsToArgs(config.extraArgs),
				],
				ports: [{ number: 8080, name: "metrics" }],
				resources: config.resourceTier,
				liveness: {
					path: "/health/ready",
					port: 8080,
					initialDelaySeconds: 5,
					timeoutSeconds: 3,
					periodSeconds: 5,
					failureThreshold: 2,
					successThreshold: 1,
				},
				readiness: {
					path: "/health/ready",
					port: 8080,
					initialDelaySeconds: 5,
					timeoutSeconds: 3,
					periodSeconds: 5,
					failureThreshold: 2,
					successThreshold: 1,
				},
				securityContext: hardenedContainer({
					runAsGroup: config.runAsGroup,
				}),
			},
		];

		const volumes: Record<string, unknown>[] = [
			{
				name: "providervol",
				hostPath: {
					path: config.providersDir,
					type: "DirectoryOrCreate",
				},
			},
		];

		const extraPatches: JsonPatch[] = [
			JsonPatch.add("/spec/template/spec/containers/0/env", [
				{
					name: "VAULT_ADDR",
					value: config.agent.enabled
						? "unix:///var/run/vault/agent.sock"
						: `https://${config.name}.${config.namespace}.svc:8200`,
				},
				{
					name: "NODE_NAME",
					valueFrom: { fieldRef: { fieldPath: "spec.nodeName" } },
				},
			]),
			JsonPatch.add("/spec/template/spec/containers/0/volumeMounts", [
				{ name: "providervol", mountPath: "/provider" },
				...(config.agent.enabled
					? [{ name: "agent-unix-socket", mountPath: "/var/run/vault" }]
					: []),
			]),
			JsonPatch.add(
				"/spec/template/spec/serviceAccountName",
				`${config.name}-csi-provider`,
			),
		];

		if (config.agent.enabled) {
			containers.push({
				name: `${config.name}-agent`,
				image: config.agent.image,
				imagePullPolicy: config.imagePullPolicy as
					| "Always"
					| "IfNotPresent"
					| "Never"
					| undefined,
				command: ["/bin/sh", "-ec"],
				args: [
					'umask 0007\nexec bao "$@"',
					"bao",
					"agent",
					"-config=/etc/vault/config.hcl",
					...flagsToArgs(config.agent.extraArgs),
				],
				ports: [{ number: 8200, name: "http" }],
				resources: config.agent.resourceTier,
				securityContext: hardenedContainer({
					runAsUser: 100,
					runAsGroup: 1000,
				}),
			});

			volumes.push(
				{
					name: "agent-config",
					configMap: {
						name: `${config.name}-csi-provider-agent-config`,
					},
				},
				{
					name: "agent-unix-socket",
					emptyDir: { medium: "Memory" },
				},
			);

			extraPatches.push(
				JsonPatch.add("/spec/template/spec/containers/1/env", [
					{ name: "BAO_LOG_LEVEL", value: config.agent.logLevel },
					{ name: "BAO_LOG_FORMAT", value: config.agent.logFormat },
				]),
				JsonPatch.add("/spec/template/spec/containers/1/volumeMounts", [
					{
						name: "agent-config",
						mountPath: "/etc/vault/config.hcl",
						subPath: "config.hcl",
						readOnly: true,
					},
					{ name: "agent-unix-socket", mountPath: "/var/run/vault" },
				]),
			);
		}

		return [
			{
				id: "ds",
				name: `${config.name}-csi-provider`,
				component: "csi",
				containers,
				volumes,
				updateStrategy: {
					type: config.updateStrategy.type as "RollingUpdate" | "OnDelete",
					...(config.updateStrategy.maxUnavailable
						? { maxUnavailable: config.updateStrategy.maxUnavailable }
						: {}),
				},
				priorityClassName: config.priorityClassName,
				tolerations: config.tolerations,
				nodeSelector: config.nodeSelector,
				affinity: config.affinity,
				extraPatches,
			} satisfies DaemonSetDef<CsiConfig>,
		];
	},
}) {
	constructor(scope: Construct, config: CsiConfig) {
		super(scope, "csi-daemonset", config);
	}
}
