/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import { KnownLatestKamajiEtcdVersion } from "Kamaji/Etcd/Version";
import {
	defineConfig,
	defineConfigMap,
	type InferConfig,
} from "@sumicare/chart-commons";
import { JsonPatch } from "cdk8s";
import { z } from "zod";

const EtcdProbeSchema = z.object({
	initialDelaySeconds: z.number().int().min(0).default(10),
	timeoutSeconds: z.number().int().min(1).default(15),
	periodSeconds: z.number().int().min(1).default(10),
	successThreshold: z.number().int().min(1).default(1),
	failureThreshold: z.number().int().min(1).default(8),
});

const CA_CSR_JSON = JSON.stringify(
	{
		key: {
			algo: "rsa",
			size: 2048,
		},
		names: [
			{
				C: "IT",
				L: "Rome",
				O: "Clastix",
				OU: "Kamaji",
				ST: "Italy",
			},
		],
	},
	null,
	2,
);

const CONFIG_JSON = JSON.stringify(
	{
		signing: {
			default: {
				expiry: "8760h",
			},
			profiles: {
				"server-authentication": {
					expiry: "8760h",
					usages: ["signing", "key encipherment", "server auth"],
				},
				"client-authentication": {
					expiry: "8760h",
					usages: ["signing", "key encipherment", "client auth"],
				},
				"peer-authentication": {
					expiry: "8760h",
					usages: ["signing", "key encipherment", "server auth", "client auth"],
				},
			},
		},
	},
	null,
	2,
);

const PEER_CSR_JSON = JSON.stringify(
	{
		key: {
			algo: "rsa",
			size: 2048,
		},
		hosts: [
			"etcd-0.etcd",
			"etcd-1.etcd",
			"etcd-2.etcd",
			"etcd-0.etcd.kamaji-system.svc.cluster.local",
			"etcd-1.etcd.kamaji-system.svc.cluster.local",
			"etcd-2.etcd.kamaji-system.svc.cluster.local",
		],
		names: [
			{
				C: "IT",
				L: "Rome",
				O: "Clastix",
				OU: "Kamaji",
				ST: "Italy",
			},
		],
	},
	null,
	2,
);

const ROOT_CLIENT_CSR_JSON = JSON.stringify(
	{
		key: {
			algo: "rsa",
			size: 2048,
		},
		names: [
			{
				C: "IT",
				L: "Rome",
				O: "Clastix",
				OU: "Kamaji root client",
				ST: "Italy",
			},
		],
	},
	null,
	2,
);

const SERVER_CSR_JSON = JSON.stringify(
	{
		key: {
			algo: "rsa",
			size: 2048,
		},
		hosts: [
			"etcd-0.etcd",
			"etcd-1.etcd",
			"etcd-2.etcd",
			"etcd-0.etcd.kamaji-system.svc.cluster.local",
			"etcd-1.etcd.kamaji-system.svc.cluster.local",
			"etcd-2.etcd.kamaji-system.svc.cluster.local",
		],
		names: [
			{
				C: "IT",
				L: "Rome",
				O: "Clastix",
				OU: "Kamaji",
				ST: "Italy",
			},
		],
	},
	null,
	2,
);

const CsrConfigSchema = z.object({
	caCsr: z.string().default(CA_CSR_JSON),
	config: z.string().default(CONFIG_JSON),
	peerCsr: z.string().default(PEER_CSR_JSON),
	rootClientCsr: z.string().default(ROOT_CLIENT_CSR_JSON),
	serverCsr: z.string().default(SERVER_CSR_JSON),
});

/** Zod schema for validating Kamaji etcd chart configuration. */
const etcdConfig = defineConfig({
	chartName: "KamajiEtcdChart",
	base: [
		"name",
		"namespace",
		"version",
		"image",
		"imagePullPolicy",
		"runAsUser",
		"runAsGroup",
		"fsGroup",
		"revisionHistoryLimit",
	],
	shared: [
		"resourceTier",
		"podSecurityContext",
		"securityContext",
		"nodeSelector",
		"tolerations",
		"priorityClassName",
		"affinity",
	],
	fields: {
		name: z
			.string()
			.describe("Base name for etcd resources")
			.default("kamaji-etcd"),
		namespace: z
			.string()
			.describe("Kubernetes namespace for etcd")
			.default("kamaji-system"),
		version: z
			.string()
			.describe("etcd container image version")
			.default(KnownLatestKamajiEtcdVersion),
		image: z
			.string()
			.describe("etcd container image")
			.default("quay.io/coreos/etcd"),
		replicas: z.number().min(1).max(7).default(3),
		persistenceSize: z
			.string()
			.describe("PVC storage size (e.g. 10Gi)")
			.default("10Gi"),
		persistenceStorageClass: z.string().optional(),
		clusterDomain: z.string().default("cluster.local"),
		livenessProbe: EtcdProbeSchema.prefault({}),
		csr: CsrConfigSchema.prefault({}),
	},
	resolveConfig: (parsed) => ({
		...parsed,
		image: `${parsed.image}:${parsed.version}`,
	}),
});

export const KamajiEtcdConfigSchema = etcdConfig.schema;
export const KamajiEtcdConfigError = etcdConfig.ConfigError;
export type Config = InferConfig<typeof etcdConfig>;
export const EtcdCsrConfigMap = defineConfigMap<Config>(
	{
		component: "etcd",
		name: "etcd-csr",
		dataSchema: z.object({
			"ca-csr.json": z.string(),
			"config.json": z.string(),
			"peer-csr.json": z.string(),
			"root-client-csr.json": z.string(),
			"server-csr.json": z.string(),
		}),
		map: (c) => ({
			"ca-csr.json": c.csr.caCsr,
			"config.json": c.csr.config,
			"peer-csr.json": c.csr.peerCsr,
			"root-client-csr.json": c.csr.rootClientCsr,
			"server-csr.json": c.csr.serverCsr,
		}),
		patches: (c) => {
			const ns = c.namespace;
			const domain = c.clusterDomain;
			const hosts = Array.from(
				{ length: c.replicas },
				(_, i) => `etcd-${i}.etcd.${ns}.svc.${domain}`,
			).concat(Array.from({ length: c.replicas }, (_, i) => `etcd-${i}.etcd`));

			const peerCsr = JSON.parse(c.csr.peerCsr);
			peerCsr.hosts = hosts;
			const serverCsr = JSON.parse(c.csr.serverCsr);
			serverCsr.hosts = hosts;

			return [
				JsonPatch.replace(
					"/data/peer-csr.json",
					JSON.stringify(peerCsr, null, 2),
				),
				JsonPatch.replace(
					"/data/server-csr.json",
					JSON.stringify(serverCsr, null, 2),
				),
			];
		},
	},
	KamajiEtcdConfigError,
);
export { etcdConfig };
