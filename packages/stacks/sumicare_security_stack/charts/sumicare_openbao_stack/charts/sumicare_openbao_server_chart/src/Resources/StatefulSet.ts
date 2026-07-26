/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { ServerConfig } from "Openbao/Server/Config";
import {
	type BaseProps,
	type ContainerDef,
	defineStatefulSet,
	hardenedContainer,
	RESOURCE_TIERS,
	type VolumeClaimTemplate,
} from "@sumicare/chart-commons";
import { JsonPatch } from "cdk8s";
import type { IServiceAccount } from "cdk8s-plus-33";
import type { Construct } from "constructs";

export class OpenbaoServerStatefulSet extends defineStatefulSet<ServerConfig>({
	statefulSets: (_scope, config) => {
		const port = 8200;
		const serviceAccount = (
			config as ServerConfig & {
				serviceAccount: IServiceAccount;
			}
		).serviceAccount;

		const container: ContainerDef = {
			name: "openbao",
			image: `${config.image}:v${config.version}`,
			imagePullPolicy: config.imagePullPolicy as
				| "Always"
				| "IfNotPresent"
				| "Never"
				| undefined,
			ports: [
				{ number: port, name: "api" },
				{ number: 8201, name: "cluster" },
				{ number: 8202, name: "rep" },
			],
			resources: RESOURCE_TIERS[config.resourceTier],
			liveness: {
				path: "/v1/sys/health",
				port,
				initialDelaySeconds: config.probes.initialDelaySeconds,
				timeoutSeconds: config.probes.timeoutSeconds,
				periodSeconds: config.probes.periodSeconds,
				failureThreshold: config.probes.failureThreshold,
				successThreshold: 1,
			},
			readiness: {
				path: "/v1/sys/health?standbyok=true",
				port,
				initialDelaySeconds: config.probes.initialDelaySeconds,
				timeoutSeconds: config.probes.timeoutSeconds,
				periodSeconds: config.probes.periodSeconds,
				failureThreshold: config.probes.failureThreshold,
				successThreshold: 1,
			},
			securityContext: hardenedContainer(),
		};

		const extraPatches: JsonPatch[] = [
			JsonPatch.add("/spec/template/spec/containers/0/env", [
				{
					name: "HOST_IP",
					valueFrom: { fieldRef: { fieldPath: "status.hostIP" } },
				},
				{
					name: "POD_IP",
					valueFrom: { fieldRef: { fieldPath: "status.podIP" } },
				},
				{ name: "BAO_ADDR", value: `https://127.0.0.1:${port}` },
				{
					name: "BAO_API_ADDR",
					value: `https://$(POD_IP):${port}`,
				},
				{
					name: "BAO_K8S_POD_NAME",
					valueFrom: {
						fieldRef: { fieldPath: "metadata.name" },
					},
				},
				{
					name: "BAO_K8S_NAMESPACE",
					valueFrom: {
						fieldRef: { fieldPath: "metadata.namespace" },
					},
				},
				{
					name: "HOSTNAME",
					valueFrom: { fieldRef: { fieldPath: "metadata.name" } },
				},
				{
					name: "BAO_CLUSTER_ADDR",
					value: `https://$(HOSTNAME).${config.name}-internal:8201`,
				},
				...(config.ha.enabled &&
				config.ha.raft.enabled &&
				config.ha.raft.setNodeId
					? [
							{
								name: "BAO_RAFT_NODE_ID",
								valueFrom: {
									fieldRef: { fieldPath: "metadata.name" },
								},
							},
						]
					: []),
				{ name: "BAO_LOG_LEVEL", value: config.logLevel },
				{ name: "BAO_LOG_FORMAT", value: config.logFormat },
				{ name: "SKIP_CHOWN", value: "true" },
				{ name: "SKIP_SETCAP", value: "true" },
				{ name: "HOME", value: "/home/openbao" },
			]),
			JsonPatch.add("/spec/template/spec/containers/0/lifecycle", {
				preStop: {
					exec: {
						command: [
							"/bin/sh",
							"-c",
							`sleep ${config.preStopSleepSeconds} && kill -SIGTERM $(pidof bao)`,
						],
					},
				},
			}),
			JsonPatch.add("/spec/template/spec/volumes", [
				{ name: "home", emptyDir: {} },
				{
					name: "config",
					configMap: { name: `${config.name}-config` },
				},
			]),
			JsonPatch.add("/spec/template/spec/containers/0/volumeMounts", [
				{ name: "home", mountPath: "/home/openbao" },
				{ name: "config", mountPath: "/openbao/config", readOnly: true },
			]),
			JsonPatch.add("/spec/template/spec/containers/0/command", [
				"/bin/sh",
				"-ec",
			]),
			JsonPatch.add("/spec/template/spec/containers/0/args", [
				`bao server -config=/openbao/config/openbao.json`,
			]),
			...(config.shareProcessNamespace
				? [JsonPatch.add("/spec/template/spec/shareProcessNamespace", true)]
				: []),
		];

		const volumeClaimTemplates: VolumeClaimTemplate[] | undefined = config.ha
			.enabled
			? [
					{
						name: "data",
						size: config.storage.size,
						...(config.storage.storageClass
							? { storageClass: config.storage.storageClass }
							: {}),
					},
				]
			: undefined;

		return [
			{
				id: "sts",
				name: config.name,
				component: "server",
				replicas: config.replicas,
				serviceName: `${config.name}-internal`,
				serviceAccount,
				terminationGracePeriodSeconds: 30,
				podSecurityContext: {
					ensureNonRoot: true,
					runAsUser: config.runAsUser,
					runAsGroup: config.runAsGroup,
					fsGroup: config.fsGroup,
				},
				hostNetwork: config.hostNetwork || undefined,
				priorityClassName: config.priorityClassName,
				extraPatches,
				containers: [container],
				volumeClaimTemplates,
			},
		];
	},
}) {
	constructor(
		scope: Construct,
		config: ServerConfig,
		serviceAccount: IServiceAccount,
	) {
		const props = { ...config, serviceAccount } as BaseProps &
			ServerConfig & { serviceAccount: IServiceAccount };
		super(scope, "server-statefulset", props);
	}
}
