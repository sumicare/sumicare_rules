/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Etcd/Config";
import {
	type ContainerDef,
	defineStatefulSet,
	hardenedContainer,
	type StatefulSetDef,
	type VolumeClaimTemplate,
} from "@sumicare/chart-commons";
import { JsonPatch } from "cdk8s";
import { EnvFieldPaths, EnvValue } from "cdk8s-plus-33";
import type { Construct } from "constructs";

/**
 * Creates the etcd StatefulSet with TLS-enabled client and peer
 * communication, persistent volume for data, and liveness probe
 * on the metrics endpoint.
 */
export class EtcdStatefulSet extends defineStatefulSet<Config>({
	statefulSets: (_scope, config) => {
		const ns = config.namespace;
		const domain = config.clusterDomain;
		const replicas = config.replicas;

		const initialCluster = Array.from(
			{ length: replicas },
			(_, i) => `etcd-${i}=https://etcd-${i}.etcd.${ns}.svc.${domain}:2380`,
		).join(",");

		const args = [
			"--data-dir=/var/run/etcd",
			"--name=$(POD_NAME)",
			"--initial-cluster-state=new",
			`--initial-cluster=${initialCluster}`,
			"--initial-advertise-peer-urls=https://$(POD_NAME).etcd.$(POD_NAMESPACE).svc.cluster.local:2380",
			"--advertise-client-urls=https://$(POD_NAME).etcd.$(POD_NAMESPACE).svc.cluster.local:2379",
			"--initial-cluster-token=kamaji",
			"--listen-client-urls=https://0.0.0.0:2379",
			"--listen-metrics-urls=http://0.0.0.0:2381",
			"--listen-peer-urls=https://0.0.0.0:2380",
			"--client-cert-auth=true",
			"--peer-client-cert-auth=true",
			"--trusted-ca-file=/etc/etcd/pki/ca.crt",
			"--cert-file=/etc/etcd/pki/server.pem",
			"--key-file=/etc/etcd/pki/server-key.pem",
			"--peer-trusted-ca-file=/etc/etcd/pki/ca.crt",
			"--peer-cert-file=/etc/etcd/pki/peer.pem",
			"--peer-key-file=/etc/etcd/pki/peer-key.pem",
			"--auto-compaction-mode=periodic",
			"--auto-compaction-retention=5m",
			"--snapshot-count=10000",
			"--quota-backend-bytes=8589934592",
			"--v=8",
		];

		const container: ContainerDef = {
			name: "etcd",
			image: config.image,
			imagePullPolicy: config.imagePullPolicy,
			command: ["etcd", ...args],
			ports: [
				{ number: 2379, name: "client" },
				{ number: 2380, name: "peer" },
			],
			envVariables: {
				POD_NAME: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAME),
				POD_NAMESPACE: EnvValue.fromFieldRef(EnvFieldPaths.POD_NAMESPACE),
			},
			resources: config.resourceTier,
			liveness: {
				path: "/health?serializable=true",
				port: 2381,
				initialDelaySeconds: config.livenessProbe.initialDelaySeconds,
				timeoutSeconds: config.livenessProbe.timeoutSeconds,
				periodSeconds: config.livenessProbe.periodSeconds,
				failureThreshold: config.livenessProbe.failureThreshold,
				successThreshold: config.livenessProbe.successThreshold,
			},
			securityContext: hardenedContainer(),
		};

		const volumeClaimTemplates: VolumeClaimTemplate[] = [
			{
				name: "data",
				size: config.persistenceSize,
				...(config.persistenceStorageClass
					? { storageClass: config.persistenceStorageClass }
					: {}),
			},
		];

		return [
			{
				id: "etcd-statefulset",
				name: "etcd",
				component: "etcd",
				replicas,
				serviceName: "etcd",
				revisionHistoryLimit: config.revisionHistoryLimit,
				podSecurityContext: {
					runAsUser: config.runAsUser,
					runAsGroup: config.runAsGroup,
					fsGroup: config.fsGroup,
				},
				containers: [container],
				volumes: [
					{
						name: "certs",
						secret: { secretName: "etcd-certs" },
					},
				],
				volumeClaimTemplates,
				extraPatches: [
					JsonPatch.add("/spec/template/spec/containers/0/volumeMounts", [
						{ name: "data", mountPath: "/var/run/etcd" },
						{ name: "certs", mountPath: "/etc/etcd/pki" },
					]),
				],
			} satisfies StatefulSetDef<Config>,
		];
	},
}) {
	constructor(scope: Construct, config: Config) {
		super(scope, "statefulset", config);
	}
}
