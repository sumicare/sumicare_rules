/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const vpa = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes", repo: "autoscaler" },
	path: "vertical-pod-autoscaler/charts/vertical-pod-autoscaler/crds",
	branch: "master",
	upstreamFile,
});

const keda = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kedacore", repo: "keda" },
	path: "config/crd/bases",
	upstreamFile,
});

const kamaji = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "clastix", repo: "kamaji" },
	path: "charts/kamaji-crds/hack",
	branch: "master",
	upstreamFile,
});

/** Single source of truth for all Compute CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		verticalpodautoscaler: {
			file: "crd-vpa.yaml",
			disableKey: "disableVerticalPodAutoscaler",
			description: "Disable VerticalPodAutoscaler CRD",
			upstream: vpa("vpa-v1-crd-gen.yaml"),
		},
		scaledobjects: {
			file: "crd-keda-scaledobjects.yaml",
			disableKey: "disableScaledObjects",
			description: "Disable ScaledObject CRD",
			upstream: keda("keda.sh_scaledobjects.yaml"),
		},
		scaledjobs: {
			file: "crd-keda-scaledjobs.yaml",
			disableKey: "disableScaledJobs",
			description: "Disable ScaledJob CRD",
			upstream: keda("keda.sh_scaledjobs.yaml"),
		},
		triggerauthentications: {
			file: "crd-keda-triggerauthentications.yaml",
			disableKey: "disableTriggerAuthentications",
			description: "Disable TriggerAuthentication CRD",
			upstream: keda("keda.sh_triggerauthentications.yaml"),
		},
		clustertriggerauthentications: {
			file: "crd-keda-clustertriggerauthentications.yaml",
			disableKey: "disableClusterTriggerAuthentications",
			description: "Disable ClusterTriggerAuthentication CRD",
			upstream: keda("keda.sh_clustertriggerauthentications.yaml"),
		},
		cloudeventsources: {
			file: "crd-keda-cloudeventsources.yaml",
			disableKey: "disableCloudEventSources",
			description: "Disable CloudEventSource CRD",
			upstream: keda("eventing.keda.sh_cloudeventsources.yaml"),
		},
		clustercloudeventsources: {
			file: "crd-keda-clustercloudeventsources.yaml",
			disableKey: "disableClusterCloudEventSources",
			description: "Disable ClusterCloudEventSource CRD",
			upstream: keda("eventing.keda.sh_clustercloudeventsources.yaml"),
		},
		datastores: {
			file: "crd-kamaji-datastores.yaml",
			disableKey: "disableDataStores",
			description: "Disable DataStore CRD",
			upstream: kamaji("kamaji.clastix.io_datastores_spec.yaml"),
		},
		kubeconfiggenerators: {
			file: "crd-kamaji-kubeconfiggenerators.yaml",
			disableKey: "disableKubeconfigGenerators",
			description: "Disable KubeconfigGenerator CRD",
			upstream: kamaji("kamaji.clastix.io_kubeconfiggenerators_spec.yaml"),
		},
		tenantcontrolplanes: {
			file: "crd-kamaji-tenantcontrolplanes.yaml",
			disableKey: "disableTenantControlPlanes",
			description: "Disable TenantControlPlane CRD",
			upstream: kamaji("kamaji.clastix.io_tenantcontrolplanes_spec.yaml"),
		},
	},
	groups: {
		vpa: {
			kinds: ["verticalpodautoscaler"],
			disableKey: "disableVpa",
			description: "Disable all VPA CRDs",
		},
		keda: {
			kinds: [
				"scaledobjects",
				"scaledjobs",
				"triggerauthentications",
				"clustertriggerauthentications",
				"cloudeventsources",
				"clustercloudeventsources",
			],
			disableKey: "disableKeda",
			description: "Disable all KEDA CRDs",
		},
		kamaji: {
			kinds: ["datastores", "kubeconfiggenerators", "tenantcontrolplanes"],
			disableKey: "disableKamaji",
			description: "Disable all Kamaji CRDs",
		},
	},
});
