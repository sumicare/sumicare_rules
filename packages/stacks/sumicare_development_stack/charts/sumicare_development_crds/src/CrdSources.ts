/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const tekton = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "cdfoundation", repo: "tekton-helm-chart" },
	path: "charts/tekton-pipeline/crds",
	upstreamFile,
});

const theia = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "eclipse-theia", repo: "theia-cloud-helm" },
	path: "charts/theia-cloud-crds/templates",
	upstreamFile,
});

/** Single source of truth for all Development CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		customruns: {
			file: "crd-tekton-customruns.yaml",
			disableKey: "disableCustomRuns",
			description: "Disable CustomRun CRD",
			upstream: tekton("customruns.tekton.dev-crd.yaml"),
		},
		pipelineruns: {
			file: "crd-tekton-pipelineruns.yaml",
			disableKey: "disablePipelineRuns",
			description: "Disable PipelineRun CRD",
			upstream: tekton("pipelineruns.tekton.dev-crd.yaml"),
		},
		pipelines: {
			file: "crd-tekton-pipelines.yaml",
			disableKey: "disablePipelines",
			description: "Disable Pipeline CRD",
			upstream: tekton("pipelines.tekton.dev-crd.yaml"),
		},
		resolutionrequests: {
			file: "crd-tekton-resolutionrequests.yaml",
			disableKey: "disableResolutionRequests",
			description: "Disable ResolutionRequest CRD",
			upstream: tekton("resolutionrequests.resolution.tekton.dev-crd.yaml"),
		},
		stepactions: {
			file: "crd-tekton-stepactions.yaml",
			disableKey: "disableStepActions",
			description: "Disable StepAction CRD",
			upstream: tekton("stepactions.tekton.dev-crd.yaml"),
		},
		taskruns: {
			file: "crd-tekton-taskruns.yaml",
			disableKey: "disableTaskRuns",
			description: "Disable TaskRun CRD",
			upstream: tekton("taskruns.tekton.dev-crd.yaml"),
		},
		tasks: {
			file: "crd-tekton-tasks.yaml",
			disableKey: "disableTasks",
			description: "Disable Task CRD",
			upstream: tekton("tasks.tekton.dev-crd.yaml"),
		},
		verificationpolicies: {
			file: "crd-tekton-verificationpolicies.yaml",
			disableKey: "disableVerificationPolicies",
			description: "Disable VerificationPolicy CRD",
			upstream: tekton("verificationpolicies.tekton.dev-crd.yaml"),
		},
		appdefinitions: {
			file: "crd-theia-appdefinitions.yaml",
			disableKey: "disableAppDefinitions",
			description: "Disable AppDefinition CRD",
			upstream: theia("appdefinition-spec-resource.yaml"),
		},
		sessions: {
			file: "crd-theia-sessions.yaml",
			disableKey: "disableSessions",
			description: "Disable Session CRD",
			upstream: theia("session-spec-resource.yaml"),
		},
		workspaces: {
			file: "crd-theia-workspaces.yaml",
			disableKey: "disableWorkspaces",
			description: "Disable Workspace CRD",
			upstream: theia("workspace-spec-resource.yaml"),
		},
	},
	groups: {
		tekton: {
			kinds: [
				"customruns",
				"pipelineruns",
				"pipelines",
				"resolutionrequests",
				"stepactions",
				"taskruns",
				"tasks",
				"verificationpolicies",
			],
			disableKey: "disableTekton",
			description: "Disable all Tekton CRDs",
		},
		theia: {
			kinds: ["appdefinitions", "sessions", "workspaces"],
			disableKey: "disableTheia",
			description: "Disable all Theia Cloud CRDs",
		},
	},
});
