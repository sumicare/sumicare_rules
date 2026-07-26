/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { Config } from "Kamaji/Etcd/Config";
import { commonLabels } from "@sumicare/chart-commons";
import { ApiObject } from "cdk8s";
import { Construct } from "constructs";

/**
 * Creates the etcd cert generation Job and the etcd setup Job.
 *
 * The cert Job runs cfssl to generate CA, peer, server, and root-client
 * certificates from the CSR ConfigMap, then creates Kubernetes secrets
 * (etcd-certs and root-client-certs) from the generated files.
 *
 * The setup Job waits for the StatefulSet to be ready, then enables
 * etcd auth by creating the root user and role.
 */
export class EtcdJobs extends Construct {
	readonly certJob: ApiObject;
	readonly setupJob: ApiObject;
	readonly teardownJob: ApiObject;

	constructor(
		scope: Construct,
		config: Config,
		csrConfigMapName: string,
		etcdServiceAccountName: string,
	) {
		super(scope, "jobs");

		const labels = {
			...commonLabels(config),
			"app.kubernetes.io/component": "etcd",
		};

		const ns = config.namespace;

		this.certJob = new ApiObject(this, "etcd-certs-job", {
			apiVersion: "batch/v1",
			kind: "Job",
			metadata: {
				name: "etcd-certs",
				namespace: ns,
				labels,
			},
			spec: {
				template: {
					metadata: {
						name: "etcd-certs",
						labels,
					},
					spec: {
						restartPolicy: "Never",
						serviceAccountName: etcdServiceAccountName,
						securityContext: {
							runAsUser: 1000,
							runAsGroup: 1000,
							fsGroup: 1000,
						},
						volumes: [
							{
								name: "csr",
								configMap: { name: csrConfigMapName },
							},
							{
								name: "certs",
								emptyDir: {},
							},
						],
						initContainers: [
							{
								name: "cfssl",
								image: "cfssl/cfssl:latest",
								command: ["bash", "-c"],
								args: [
									"cfssl gencert -initca /csr/ca-csr.json | cfssljson -bare /certs/ca && " +
										"mv /certs/ca.pem /certs/ca.crt && mv /certs/ca-key.pem /certs/ca.key && " +
										"cfssl gencert -ca=/certs/ca.crt -ca-key=/certs/ca.key -config=/csr/config.json -profile=peer-authentication /csr/peer-csr.json | cfssljson -bare /certs/peer && " +
										"cfssl gencert -ca=/certs/ca.crt -ca-key=/certs/ca.key -config=/csr/config.json -profile=peer-authentication /csr/server-csr.json | cfssljson -bare /certs/server && " +
										"cfssl gencert -ca=/certs/ca.crt -ca-key=/certs/ca.key -config=/csr/config.json -profile=client-authentication /csr/root-client-csr.json | cfssljson -bare /certs/root-client",
								],
								volumeMounts: [
									{ name: "certs", mountPath: "/certs" },
									{ name: "csr", mountPath: "/csr" },
								],
							},
						],
						containers: [
							{
								name: "kubectl",
								image: "clastix/kubectl:v1.35",
								command: ["/bin/sh", "-c"],
								args: [
									`if kubectl get secret etcd-certs --namespace=${ns} &>/dev/null; then ` +
										'echo "Secret etcd-certs already exists"; else ' +
										'echo "Creating secret etcd-certs"; ' +
										`kubectl --namespace=${ns} create secret generic etcd-certs ` +
										"--from-file=/certs/ca.crt --from-file=/certs/ca.key " +
										"--from-file=/certs/peer-key.pem --from-file=/certs/peer.pem " +
										"--from-file=/certs/server-key.pem --from-file=/certs/server.pem; fi && " +
										`if kubectl get secret root-client-certs --namespace=${ns} &>/dev/null; then ` +
										'echo "Secret root-client-certs already exists"; else ' +
										'echo "Creating secret root-client-certs"; ' +
										`kubectl --namespace=${ns} create secret tls root-client-certs ` +
										"--key=/certs/root-client-key.pem --cert=/certs/root-client.pem; fi",
								],
								volumeMounts: [{ name: "certs", mountPath: "/certs" }],
							},
						],
					},
				},
			},
		});

		this.setupJob = new ApiObject(this, "etcd-setup-job", {
			apiVersion: "batch/v1",
			kind: "Job",
			metadata: {
				name: "etcd-setup",
				namespace: ns,
				labels,
			},
			spec: {
				template: {
					metadata: {
						name: "etcd-setup",
						labels,
					},
					spec: {
						restartPolicy: "Never",
						serviceAccountName: etcdServiceAccountName,
						securityContext: {
							runAsUser: 1000,
							runAsGroup: 1000,
							fsGroup: 1000,
						},
						volumes: [
							{
								name: "root-certs",
								secret: { secretName: "root-client-certs" },
							},
							{
								name: "certs",
								secret: { secretName: "etcd-certs" },
							},
						],
						initContainers: [
							{
								name: "kubectl",
								image: "clastix/kubectl:v1.35",
								command: [
									"sh",
									"-c",
									`kubectl --namespace=${ns} rollout status sts/etcd --timeout=300s`,
								],
							},
						],
						containers: [
							{
								name: "etcd-client",
								image: "quay.io/coreos/etcd:v3.5.1",
								imagePullPolicy: "Always",
								command: ["bash", "-c"],
								args: [
									"etcdctl member list -w table\n" +
										"if etcdctl user get root &>/dev/null; then\n" +
										'  echo "User already exists, nothing to do"\n' +
										"else\n" +
										"  etcdctl user add --no-password=true root &&\n" +
										"  etcdctl role add root &&\n" +
										"  etcdctl user grant-role root root &&\n" +
										"  etcdctl auth enable\n" +
										"fi",
								],
								env: [
									{
										name: "ETCDCTL_ENDPOINTS",
										value: `https://etcd-0.etcd.${ns}.svc.cluster.local:2379`,
									},
									{
										name: "ETCDCTL_CACERT",
										value: "/opt/certs/ca/ca.crt",
									},
									{
										name: "ETCDCTL_CERT",
										value: "/opt/certs/root-certs/tls.crt",
									},
									{
										name: "ETCDCTL_KEY",
										value: "/opt/certs/root-certs/tls.key",
									},
								],
								volumeMounts: [
									{ name: "root-certs", mountPath: "/opt/certs/root-certs" },
									{ name: "certs", mountPath: "/opt/certs/ca" },
								],
							},
						],
					},
				},
			},
		});

		this.teardownJob = new ApiObject(this, "etcd-teardown-job", {
			apiVersion: "batch/v1",
			kind: "Job",
			metadata: {
				name: "etcd-teardown",
				namespace: ns,
				labels,
			},
			spec: {
				template: {
					metadata: {
						name: "etcd-teardown",
						labels,
					},
					spec: {
						restartPolicy: "Never",
						serviceAccountName: etcdServiceAccountName,
						containers: [
							{
								name: "kubectl",
								image: "clastix/kubectl:v1.35",
								command: [
									"kubectl",
									`--namespace=${ns}`,
									"delete",
									"secret",
									"--ignore-not-found=true",
									"etcd-certs",
									"root-client-certs",
								],
							},
						],
					},
				},
			},
		});
	}
}
