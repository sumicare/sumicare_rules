/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const argocd = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "argoproj", repo: "argo-helm" },
	path: "charts/argo-cd/templates/crds",
	upstreamFile,
});

const argoevents = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "argoproj", repo: "argo-helm" },
	path: "charts/argo-events/templates/crds",
	upstreamFile,
});

const argorollouts = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "argoproj", repo: "argo-helm" },
	path: "charts/argo-rollouts/templates/crds",
	upstreamFile,
});

const argoworkflows = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "argoproj", repo: "argo-helm" },
	path: "charts/argo-workflows/files/crds/full",
	upstreamFile,
});

/** Single source of truth for all Gitops CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		applications: {
			file: "crd-argocd-application.yaml",
			disableKey: "disableApplications",
			description: "Disable Application CRD",
			upstream: argocd("crd-application.yaml"),
		},
		applicationsets: {
			file: "crd-argocd-applicationset.yaml",
			disableKey: "disableApplicationSets",
			description: "Disable ApplicationSet CRD",
			upstream: argocd("crd-applicationset.yaml"),
		},
		appprojects: {
			file: "crd-argocd-appproject.yaml",
			disableKey: "disableAppProjects",
			description: "Disable AppProject CRD",
			upstream: argocd("crd-appproject.yaml"),
		},
		eventbuses: {
			file: "crd-argoevents-eventbus.yaml",
			disableKey: "disableEventBuses",
			description: "Disable EventBus CRD",
			upstream: argoevents("eventbus-crd.yml"),
		},
		eventsources: {
			file: "crd-argoevents-eventsources.yaml",
			disableKey: "disableEventSources",
			description: "Disable EventSource CRD",
			upstream: argoevents("eventsources-crd.yml"),
		},
		sensors: {
			file: "crd-argoevents-sensors.yaml",
			disableKey: "disableSensors",
			description: "Disable Sensor CRD",
			upstream: argoevents("sensors-crd.yml"),
		},
		analysisruns: {
			file: "crd-argorollouts-analysisrun.yaml",
			disableKey: "disableAnalysisRuns",
			description: "Disable AnalysisRun CRD",
			upstream: argorollouts("analysis-run-crd.yaml"),
		},
		analysistemplates: {
			file: "crd-argorollouts-analysistemplate.yaml",
			disableKey: "disableAnalysisTemplates",
			description: "Disable AnalysisTemplate CRD",
			upstream: argorollouts("analysis-template-crd.yaml"),
		},
		clusteranalysistemplates: {
			file: "crd-argorollouts-clusteranalysistemplate.yaml",
			disableKey: "disableClusterAnalysisTemplates",
			description: "Disable ClusterAnalysisTemplate CRD",
			upstream: argorollouts("cluster-analysis-template-crd.yaml"),
		},
		experiments: {
			file: "crd-argorollouts-experiment.yaml",
			disableKey: "disableExperiments",
			description: "Disable Experiment CRD",
			upstream: argorollouts("experiment-crd.yaml"),
		},
		rollouts: {
			file: "crd-argorollouts-rollout.yaml",
			disableKey: "disableRollouts",
			description: "Disable Rollout CRD",
			upstream: argorollouts("rollout-crd.yaml"),
		},
		clusterworkflowtemplates: {
			file: "crd-argoworkflows-clusterworkflowtemplates.yaml",
			disableKey: "disableClusterWorkflowTemplates",
			description: "Disable ClusterWorkflowTemplate CRD",
			upstream: argoworkflows("argoproj.io_clusterworkflowtemplates.yaml"),
		},
		cronworkflows: {
			file: "crd-argoworkflows-cronworkflows.yaml",
			disableKey: "disableCronWorkflows",
			description: "Disable CronWorkflow CRD",
			upstream: argoworkflows("argoproj.io_cronworkflows.yaml"),
		},
		workfloweventbindings: {
			file: "crd-argoworkflows-workfloweventbindings.yaml",
			disableKey: "disableWorkflowEventBindings",
			description: "Disable WorkflowEventBinding CRD",
			upstream: argoworkflows("argoproj.io_workfloweventbindings.yaml"),
		},
		workflows: {
			file: "crd-argoworkflows-workflows.yaml",
			disableKey: "disableWorkflows",
			description: "Disable Workflow CRD",
			upstream: argoworkflows("argoproj.io_workflows.yaml"),
		},
		workflowtaskresults: {
			file: "crd-argoworkflows-workflowtaskresults.yaml",
			disableKey: "disableWorkflowTaskResults",
			description: "Disable WorkflowTaskResult CRD",
			upstream: argoworkflows("argoproj.io_workflowtaskresults.yaml"),
		},
		workflowtemplates: {
			file: "crd-argoworkflows-workflowtemplates.yaml",
			disableKey: "disableWorkflowTemplates",
			description: "Disable WorkflowTemplate CRD",
			upstream: argoworkflows("argoproj.io_workflowtemplates.yaml"),
		},
	},
	groups: {
		argocd: {
			kinds: ["applications", "applicationsets", "appprojects"],
			disableKey: "disableArgoCd",
			description: "Disable all Argo CD CRDs",
		},
		argoevents: {
			kinds: ["eventbuses", "eventsources", "sensors"],
			disableKey: "disableArgoEvents",
			description: "Disable all Argo Events CRDs",
		},
		argorollouts: {
			kinds: [
				"analysisruns",
				"analysistemplates",
				"clusteranalysistemplates",
				"experiments",
				"rollouts",
			],
			disableKey: "disableArgoRollouts",
			description: "Disable all Argo Rollouts CRDs",
		},
		argoworkflows: {
			kinds: [
				"clusterworkflowtemplates",
				"cronworkflows",
				"workfloweventbindings",
				"workflows",
				"workflowtaskresults",
				"workflowtemplates",
			],
			disableKey: "disableArgoWorkflows",
			description: "Disable all Argo Workflows CRDs",
		},
	},
});
