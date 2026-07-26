/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const kubearmorOperator = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubearmor", repo: "KubeArmor" },
	path: "deployments/helm/KubeArmorOperator/crds",
	upstreamFile,
});

const kubearmor = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubearmor", repo: "KubeArmor" },
	path: "deployments/helm/KubeArmor/templates/crds",
	upstreamFile,
});

const kyvernoIo = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kyverno", repo: "kyverno" },
	path: "charts/kyverno/charts/crds/templates/kyverno.io",
	upstreamFile,
});

const kyvernoReports = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kyverno", repo: "kyverno" },
	path: "charts/kyverno/charts/crds/templates/reports.kyverno.io",
	upstreamFile,
});

const kyvernoWg = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kyverno", repo: "kyverno" },
	path: "charts/kyverno/charts/crds/templates/wgpolicyk8s.io",
	upstreamFile,
});

const falco = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "falcosecurity", repo: "falco-operator" },
	path: "chart/falco-operator/crds",
	upstreamFile,
});

const secretsStoreCsi = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "kubernetes-sigs", repo: "secrets-store-csi-driver" },
	path: "config/crd/bases",
	upstreamFile,
});

/** Single source of truth for all Security CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		kubearmorconfigs: {
			file: "crd-kubearmor-configs.yaml",
			disableKey: "disableKubearmorConfigs",
			description: "Disable KubeArmorConfig CRD",
			upstream: kubearmorOperator(
				"operator.kubearmor.com_kubearmorconfigs.yaml",
			),
		},
		csps: {
			file: "crd-kubearmor-csp.yaml",
			disableKey: "disableCsps",
			description: "Disable KubeArmorHostPolicy CRD",
			upstream: kubearmor("csp.yaml"),
		},
		hsps: {
			file: "crd-kubearmor-hsp.yaml",
			disableKey: "disableHsps",
			description: "Disable KubeArmorHostPolicy CRD",
			upstream: kubearmor("hsp.yaml"),
		},
		ksps: {
			file: "crd-kubearmor-ksp.yaml",
			disableKey: "disableKsps",
			description: "Disable KubeArmorPolicy CRD",
			upstream: kubearmor("ksp.yaml"),
		},
		nsps: {
			file: "crd-kubearmor-nsp.yaml",
			disableKey: "disableNsps",
			description: "Disable KubeArmorNetworkPolicy CRD",
			upstream: kubearmor("nsp.yaml"),
		},
		cleanuppolicies: {
			file: "crd-kyverno-cleanuppolicies.yaml",
			disableKey: "disableCleanupPolicies",
			description: "Disable CleanupPolicy CRD",
			upstream: kyvernoIo("kyverno.io_cleanuppolicies.yaml"),
		},
		clustercleanuppolicies: {
			file: "crd-kyverno-clustercleanuppolicies.yaml",
			disableKey: "disableClusterCleanupPolicies",
			description: "Disable ClusterCleanupPolicy CRD",
			upstream: kyvernoIo("kyverno.io_clustercleanuppolicies.yaml"),
		},
		clusterpolicies: {
			file: "crd-kyverno-clusterpolicies.yaml",
			disableKey: "disableClusterPolicies",
			description: "Disable ClusterPolicy CRD",
			upstream: kyvernoIo("kyverno.io_clusterpolicies.yaml"),
		},
		globalcontextentries: {
			file: "crd-kyverno-globalcontextentries.yaml",
			disableKey: "disableGlobalContextEntries",
			description: "Disable GlobalContextEntry CRD",
			upstream: kyvernoIo("kyverno.io_globalcontextentries.yaml"),
		},
		policies: {
			file: "crd-kyverno-policies.yaml",
			disableKey: "disablePolicies",
			description: "Disable Policy CRD",
			upstream: kyvernoIo("kyverno.io_policies.yaml"),
		},
		policyexceptions: {
			file: "crd-kyverno-policyexceptions.yaml",
			disableKey: "disablePolicyExceptions",
			description: "Disable PolicyException CRD",
			upstream: kyvernoIo("kyverno.io_policyexceptions.yaml"),
		},
		updaterequests: {
			file: "crd-kyverno-updaterequests.yaml",
			disableKey: "disableUpdateRequests",
			description: "Disable UpdateRequest CRD",
			upstream: kyvernoIo("kyverno.io_updaterequests.yaml"),
		},
		clusterephemeralreports: {
			file: "crd-kyverno-clusterephemeralreports.yaml",
			disableKey: "disableClusterEphemeralReports",
			description: "Disable ClusterEphemeralReport CRD",
			upstream: kyvernoReports(
				"reports.kyverno.io_clusterephemeralreports.yaml",
			),
		},
		ephemeralreports: {
			file: "crd-kyverno-ephemeralreports.yaml",
			disableKey: "disableEphemeralReports",
			description: "Disable EphemeralReport CRD",
			upstream: kyvernoReports("reports.kyverno.io_ephemeralreports.yaml"),
		},
		clusterpolicyreports: {
			file: "crd-kyverno-clusterpolicyreports.yaml",
			disableKey: "disableClusterPolicyReports",
			description: "Disable ClusterPolicyReport CRD",
			upstream: kyvernoWg("wgpolicyk8s.io_clusterpolicyreports.yaml"),
		},
		policyreports: {
			file: "crd-kyverno-policyreports.yaml",
			disableKey: "disablePolicyReports",
			description: "Disable PolicyReport CRD",
			upstream: kyvernoWg("wgpolicyk8s.io_policyreports.yaml"),
		},
		falcoconfigs: {
			file: "crd-falco-configs.yaml",
			disableKey: "disableFalcoConfigs",
			description: "Disable FalcoConfig CRD",
			upstream: falco("artifact.falcosecurity.dev_configs.yaml"),
		},
		falcoplugins: {
			file: "crd-falco-plugins.yaml",
			disableKey: "disableFalcoPlugins",
			description: "Disable FalcoPlugin CRD",
			upstream: falco("artifact.falcosecurity.dev_plugins.yaml"),
		},
		falcorulesfiles: {
			file: "crd-falco-rulesfiles.yaml",
			disableKey: "disableFalcoRulesFiles",
			description: "Disable FalcoRulesFile CRD",
			upstream: falco("artifact.falcosecurity.dev_rulesfiles.yaml"),
		},
		falcocomponents: {
			file: "crd-falco-components.yaml",
			disableKey: "disableFalcoComponents",
			description: "Disable FalcoComponent CRD",
			upstream: falco("instance.falcosecurity.dev_components.yaml"),
		},
		falcos: {
			file: "crd-falco-falcos.yaml",
			disableKey: "disableFalcos",
			description: "Disable Falco CRD",
			upstream: falco("instance.falcosecurity.dev_falcos.yaml"),
		},
		secretproviderclasses: {
			file: "crd-secrets-store-csi-secretproviderclasses.yaml",
			disableKey: "disableSecretProviderClasses",
			description: "Disable SecretProviderClass CRD",
			upstream: secretsStoreCsi(
				"secrets-store.csi.x-k8s.io_secretproviderclasses.yaml",
			),
		},
	},
	groups: {
		kubearmor: {
			kinds: ["kubearmorconfigs", "csps", "hsps", "ksps", "nsps"],
			disableKey: "disableKubearmor",
			description: "Disable all KubeArmor CRDs",
		},
		kyverno: {
			kinds: [
				"cleanuppolicies",
				"clustercleanuppolicies",
				"clusterpolicies",
				"globalcontextentries",
				"policies",
				"policyexceptions",
				"updaterequests",
				"clusterephemeralreports",
				"ephemeralreports",
				"clusterpolicyreports",
				"policyreports",
			],
			disableKey: "disableKyverno",
			description: "Disable all Kyverno CRDs",
		},
		falco: {
			kinds: [
				"falcoconfigs",
				"falcoplugins",
				"falcorulesfiles",
				"falcocomponents",
				"falcos",
			],
			disableKey: "disableFalco",
			description: "Disable all Falco Operator CRDs",
		},
		secretsstorecsi: {
			kinds: ["secretproviderclasses"],
			disableKey: "disableSecretsStoreCsi",
			description: "Disable all Secrets Store CSI Driver CRDs",
		},
	},
});
