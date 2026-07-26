/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const strimzi = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "strimzi", repo: "strimzi-kafka-operator" },
	path: "helm-charts/helm3/strimzi-kafka-operator/crds",
	upstreamFile,
});

const flink = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "apache", repo: "flink-kubernetes-operator" },
	path: "helm/flink-kubernetes-operator/crds",
	upstreamFile,
});

/** Single source of truth for all Data CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		kafkas: {
			file: "crd-strimzi-kafka.yaml",
			disableKey: "disableKafkas",
			description: "Disable Kafka CRD",
			upstream: strimzi("040-Crd-kafka.yaml"),
		},
		kafkaconnects: {
			file: "crd-strimzi-kafkaconnect.yaml",
			disableKey: "disableKafkaConnects",
			description: "Disable KafkaConnect CRD",
			upstream: strimzi("041-Crd-kafkaconnect.yaml"),
		},
		strimzipodsets: {
			file: "crd-strimzi-strimzipodset.yaml",
			disableKey: "disableStrimziPodSets",
			description: "Disable StrimziPodSet CRD",
			upstream: strimzi("042-Crd-strimzipodset.yaml"),
		},
		kafkatopics: {
			file: "crd-strimzi-kafkatopic.yaml",
			disableKey: "disableKafkaTopics",
			description: "Disable KafkaTopic CRD",
			upstream: strimzi("043-Crd-kafkatopic.yaml"),
		},
		kafkausers: {
			file: "crd-strimzi-kafkauser.yaml",
			disableKey: "disableKafkaUsers",
			description: "Disable KafkaUser CRD",
			upstream: strimzi("044-Crd-kafkauser.yaml"),
		},
		kafkanodepools: {
			file: "crd-strimzi-kafkanodepool.yaml",
			disableKey: "disableKafkaNodePools",
			description: "Disable KafkaNodePool CRD",
			upstream: strimzi("045-Crd-kafkanodepool.yaml"),
		},
		kafkabridges: {
			file: "crd-strimzi-kafkabridge.yaml",
			disableKey: "disableKafkaBridges",
			description: "Disable KafkaBridge CRD",
			upstream: strimzi("046-Crd-kafkabridge.yaml"),
		},
		kafkaconnectors: {
			file: "crd-strimzi-kafkaconnector.yaml",
			disableKey: "disableKafkaConnectors",
			description: "Disable KafkaConnector CRD",
			upstream: strimzi("047-Crd-kafkaconnector.yaml"),
		},
		kafkamirrormaker2s: {
			file: "crd-strimzi-kafkamirrormaker2.yaml",
			disableKey: "disableKafkaMirrorMaker2s",
			description: "Disable KafkaMirrorMaker2 CRD",
			upstream: strimzi("048-Crd-kafkamirrormaker2.yaml"),
		},
		kafkarebalances: {
			file: "crd-strimzi-kafkarebalance.yaml",
			disableKey: "disableKafkaRebalances",
			description: "Disable KafkaRebalance CRD",
			upstream: strimzi("049-Crd-kafkarebalance.yaml"),
		},
		natsclusters: {
			file: "crd-nats.yaml",
			disableKey: "disableNatsClusters",
			description: "Disable NatsCluster CRD",
			upstream: {
				repo: { owner: "nats-io", repo: "k8s" },
				path: "helm/charts/nats-operator/crds",
				upstreamFile: "customresourcedefinition.yaml",
			},
		},
		flinkdeployments: {
			file: "crd-flink-deployments.yaml",
			disableKey: "disableFlinkDeployments",
			description: "Disable FlinkDeployment CRD",
			upstream: flink("flinkdeployments.flink.apache.org-v1.yml"),
		},
		flinksessionjobs: {
			file: "crd-flink-sessionjobs.yaml",
			disableKey: "disableFlinkSessionJobs",
			description: "Disable FlinkSessionJob CRD",
			upstream: flink("flinksessionjobs.flink.apache.org-v1.yml"),
		},
		flinkbluegreendeployments: {
			file: "crd-flink-bluegreendeployments.yaml",
			disableKey: "disableFlinkBlueGreenDeployments",
			description: "Disable FlinkBlueGreenDeployment CRD",
			upstream: flink("flinkbluegreendeployments.flink.apache.org-v1.yml"),
		},
		flinkstatesnapshots: {
			file: "crd-flink-statesnapshots.yaml",
			disableKey: "disableFlinkStateSnapshots",
			description: "Disable FlinkStateSnapshot CRD",
			upstream: flink("flinkstatesnapshots.flink.apache.org-v1.yml"),
		},
	},
	groups: {
		strimzi: {
			kinds: [
				"kafkas",
				"kafkaconnects",
				"strimzipodsets",
				"kafkatopics",
				"kafkausers",
				"kafkanodepools",
				"kafkabridges",
				"kafkaconnectors",
				"kafkamirrormaker2s",
				"kafkarebalances",
			],
			disableKey: "disableStrimzi",
			description: "Disable all Strimzi CRDs",
		},
		nats: {
			kinds: ["natsclusters"],
			disableKey: "disableNats",
			description: "Disable all NATS CRDs",
		},
		flink: {
			kinds: [
				"flinkdeployments",
				"flinksessionjobs",
				"flinkbluegreendeployments",
				"flinkstatesnapshots",
			],
			disableKey: "disableFlink",
			description: "Disable all Flink CRDs",
		},
	},
});
