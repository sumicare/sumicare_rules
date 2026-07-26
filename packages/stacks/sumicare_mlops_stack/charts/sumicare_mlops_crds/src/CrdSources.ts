/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const agentgateway = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "agentgateway", repo: "agentgateway" },
	path: "controller/install/helm/agentgateway-crds/templates",
	upstreamFile,
});

const kagent = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kagent-dev", repo: "kagent" },
	path: "helm/kagent-crds/templates",
	upstreamFile,
});

const kuberay = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "ray-project", repo: "kuberay-helm" },
	path: "helm-chart/kuberay-operator/crds",
	upstreamFile,
});

const ome = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "ome-projects", repo: "ome" },
	path: "charts/ome-crd/templates",
	upstreamFile,
});

const vllm = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "vllm-project", repo: "production-stack" },
	path: "helm/crds",
	upstreamFile,
});

const volcano = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "volcano-sh", repo: "volcano" },
	path: "config/crd/volcano/bases",
	branch: "master",
	upstreamFile,
});

const volcanoJobflow = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "volcano-sh", repo: "volcano" },
	path: "config/crd/jobflow/bases",
	branch: "master",
	upstreamFile,
});

/** Single source of truth for all Mlops CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		agentgatewaybackends: {
			file: "crd-agentgateway-backends.yaml",
			disableKey: "disableAgentGatewayBackends",
			description: "Disable AgentGatewayBackend CRD",
			upstream: agentgateway("agentgateway.dev_agentgatewaybackends.yaml"),
		},
		agentgatewaymodels: {
			file: "crd-agentgateway-models.yaml",
			disableKey: "disableAgentGatewayModels",
			description: "Disable AgentGatewayModel CRD",
			upstream: agentgateway("agentgateway.dev_agentgatewaymodels.yaml"),
		},
		agentgatewayparameters: {
			file: "crd-agentgateway-parameters.yaml",
			disableKey: "disableAgentGatewayParameters",
			description: "Disable AgentGatewayParameter CRD",
			upstream: agentgateway("agentgateway.dev_agentgatewayparameters.yaml"),
		},
		agentgatewaypolicies: {
			file: "crd-agentgateway-policies.yaml",
			disableKey: "disableAgentGatewayPolicies",
			description: "Disable AgentGatewayPolicy CRD",
			upstream: agentgateway("agentgateway.dev_agentgatewaypolicies.yaml"),
		},
		agentharnesses: {
			file: "crd-kagent-agentharnesses.yaml",
			disableKey: "disableAgentHarnesses",
			description: "Disable AgentHarness CRD",
			upstream: kagent("kagent.dev_agentharnesses.yaml"),
		},
		agents: {
			file: "crd-kagent-agents.yaml",
			disableKey: "disableAgents",
			description: "Disable Agent CRD",
			upstream: kagent("kagent.dev_agents.yaml"),
		},
		memories: {
			file: "crd-kagent-memories.yaml",
			disableKey: "disableMemories",
			description: "Disable Memory CRD",
			upstream: kagent("kagent.dev_memories.yaml"),
		},
		modelconfigs: {
			file: "crd-kagent-modelconfigs.yaml",
			disableKey: "disableModelConfigs",
			description: "Disable ModelConfig CRD",
			upstream: kagent("kagent.dev_modelconfigs.yaml"),
		},
		modelproviderconfigs: {
			file: "crd-kagent-modelproviderconfigs.yaml",
			disableKey: "disableModelProviderConfigs",
			description: "Disable ModelProviderConfig CRD",
			upstream: kagent("kagent.dev_modelproviderconfigs.yaml"),
		},
		remotemcpservers: {
			file: "crd-kagent-remotemcpservers.yaml",
			disableKey: "disableRemoteMcpServers",
			description: "Disable RemoteMcpServer CRD",
			upstream: kagent("kagent.dev_remotemcpservers.yaml"),
		},
		sandboxagents: {
			file: "crd-kagent-sandboxagents.yaml",
			disableKey: "disableSandboxAgents",
			description: "Disable SandboxAgent CRD",
			upstream: kagent("kagent.dev_sandboxagents.yaml"),
		},
		toolservers: {
			file: "crd-kagent-toolservers.yaml",
			disableKey: "disableToolServers",
			description: "Disable ToolServer CRD",
			upstream: kagent("kagent.dev_toolservers.yaml"),
		},
		rayclusters: {
			file: "crd-kuberay-rayclusters.yaml",
			disableKey: "disableRayClusters",
			description: "Disable RayCluster CRD",
			upstream: kuberay("ray.io_rayclusters.yaml"),
		},
		rayjobs: {
			file: "crd-kuberay-rayjobs.yaml",
			disableKey: "disableRayJobs",
			description: "Disable RayJob CRD",
			upstream: kuberay("ray.io_rayjobs.yaml"),
		},
		rayservices: {
			file: "crd-kuberay-rayservices.yaml",
			disableKey: "disableRayServices",
			description: "Disable RayService CRD",
			upstream: kuberay("ray.io_rayservices.yaml"),
		},
		acceleratorclasses: {
			file: "crd-ome-acceleratorclasses.yaml",
			disableKey: "disableAcceleratorClasses",
			description: "Disable AcceleratorClass CRD",
			upstream: ome("ome.io_acceleratorclasses.yaml"),
		},
		basemodels: {
			file: "crd-ome-basemodels.yaml",
			disableKey: "disableBaseModels",
			description: "Disable BaseModel CRD",
			upstream: ome("ome.io_basemodels.yaml"),
		},
		benchmarkjobs: {
			file: "crd-ome-benchmarkjobs.yaml",
			disableKey: "disableBenchmarkJobs",
			description: "Disable BenchmarkJob CRD",
			upstream: ome("ome.io_benchmarkjobs.yaml"),
		},
		clusterbasemodels: {
			file: "crd-ome-clusterbasemodels.yaml",
			disableKey: "disableClusterBaseModels",
			description: "Disable ClusterBaseModel CRD",
			upstream: ome("ome.io_clusterbasemodels.yaml"),
		},
		clusterservingruntimes: {
			file: "crd-ome-clusterservingruntimes.yaml",
			disableKey: "disableClusterServingRuntimes",
			description: "Disable ClusterServingRuntime CRD",
			upstream: ome("ome.io_clusterservingruntimes.yaml"),
		},
		finetunedweights: {
			file: "crd-ome-finetunedweights.yaml",
			disableKey: "disableFinetunedWeights",
			description: "Disable FinetunedWeight CRD",
			upstream: ome("ome.io_finetunedweights.yaml"),
		},
		inferenceservices: {
			file: "crd-ome-inferenceservices.yaml",
			disableKey: "disableInferenceServices",
			description: "Disable InferenceService CRD",
			upstream: ome("ome.io_inferenceservices.yaml"),
		},
		servingruntimes: {
			file: "crd-ome-servingruntimes.yaml",
			disableKey: "disableServingRuntimes",
			description: "Disable ServingRuntime CRD",
			upstream: ome("ome.io_servingruntimes.yaml"),
		},
		loraadapters: {
			file: "crd-vllm-loraadapter.yaml",
			disableKey: "disableLoraAdapters",
			description: "Disable LoraAdapter CRD",
			upstream: vllm("crd-lora-adapter.yaml"),
		},
		cronjobs: {
			file: "crd-volcano-cronjobs.yaml",
			disableKey: "disableCronJobs",
			description: "Disable CronJob CRD",
			upstream: volcano("batch.volcano.sh_cronjobs.yaml"),
		},
		jobs: {
			file: "crd-volcano-jobs.yaml",
			disableKey: "disableJobs",
			description: "Disable Job CRD",
			upstream: volcano("batch.volcano.sh_jobs.yaml"),
		},
		commands: {
			file: "crd-volcano-commands.yaml",
			disableKey: "disableCommands",
			description: "Disable Command CRD",
			upstream: volcano("bus.volcano.sh_commands.yaml"),
		},
		colocationconfigurations: {
			file: "crd-volcano-colocationconfigurations.yaml",
			disableKey: "disableColocationConfigurations",
			description: "Disable ColocationConfiguration CRD",
			upstream: volcano("config.volcano.sh_colocationconfigurations.yaml"),
		},
		numatopologies: {
			file: "crd-volcano-numatopologies.yaml",
			disableKey: "disableNumaTopologies",
			description: "Disable NumaTopology CRD",
			upstream: volcano("nodeinfo.volcano.sh_numatopologies.yaml"),
		},
		podgroups: {
			file: "crd-volcano-podgroups.yaml",
			disableKey: "disablePodGroups",
			description: "Disable PodGroup CRD",
			upstream: volcano("scheduling.volcano.sh_podgroups.yaml"),
		},
		queues: {
			file: "crd-volcano-queues.yaml",
			disableKey: "disableQueues",
			description: "Disable Queue CRD",
			upstream: volcano("scheduling.volcano.sh_queues.yaml"),
		},
		nodeshards: {
			file: "crd-volcano-nodeshards.yaml",
			disableKey: "disableNodeShards",
			description: "Disable NodeShard CRD",
			upstream: volcano("shard.volcano.sh_nodeshards.yaml"),
		},
		hypernodes: {
			file: "crd-volcano-hypernodes.yaml",
			disableKey: "disableHyperNodes",
			description: "Disable HyperNode CRD",
			upstream: volcano("topology.volcano.sh_hypernodes.yaml"),
		},
		jobflows: {
			file: "crd-volcano-jobflows.yaml",
			disableKey: "disableJobFlows",
			description: "Disable JobFlow CRD",
			upstream: volcanoJobflow("flow.volcano.sh_jobflows.yaml"),
		},
		jobtemplates: {
			file: "crd-volcano-jobtemplates.yaml",
			disableKey: "disableJobTemplates",
			description: "Disable JobTemplate CRD",
			upstream: volcanoJobflow("flow.volcano.sh_jobtemplates.yaml"),
		},
	},
	groups: {
		agentgateway: {
			kinds: [
				"agentgatewaybackends",
				"agentgatewaymodels",
				"agentgatewayparameters",
				"agentgatewaypolicies",
			],
			disableKey: "disableAgentGateway",
			description: "Disable all AgentGateway CRDs",
		},
		kagent: {
			kinds: [
				"agentharnesses",
				"agents",
				"memories",
				"modelconfigs",
				"modelproviderconfigs",
				"remotemcpservers",
				"sandboxagents",
				"toolservers",
			],
			disableKey: "disableKagent",
			description: "Disable all Kagent CRDs",
		},
		kuberay: {
			kinds: ["rayclusters", "rayjobs", "rayservices"],
			disableKey: "disableKubeRay",
			description: "Disable all KubeRay CRDs",
		},
		ome: {
			kinds: [
				"acceleratorclasses",
				"basemodels",
				"benchmarkjobs",
				"clusterbasemodels",
				"clusterservingruntimes",
				"finetunedweights",
				"inferenceservices",
				"servingruntimes",
			],
			disableKey: "disableOme",
			description: "Disable all OME CRDs",
		},
		vllm: {
			kinds: ["loraadapters"],
			disableKey: "disableVllm",
			description: "Disable all vLLM CRDs",
		},
		volcano: {
			kinds: [
				"cronjobs",
				"jobs",
				"commands",
				"colocationconfigurations",
				"numatopologies",
				"podgroups",
				"queues",
				"nodeshards",
				"hypernodes",
				"jobflows",
				"jobtemplates",
			],
			disableKey: "disableVolcano",
			description: "Disable all Volcano CRDs",
		},
	},
});
