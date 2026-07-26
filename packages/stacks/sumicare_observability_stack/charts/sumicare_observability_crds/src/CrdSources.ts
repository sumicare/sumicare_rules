/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

import type { GithubUpstreamSource } from "@sumicare/chart-commons";
import { defineCrdSources } from "@sumicare/chart-commons";

const prometheusCommunity: GithubUpstreamSource = {
	repo: { owner: "prometheus-community", repo: "helm-charts" },
	path: "charts/kube-prometheus-stack/charts/crds/crds",
	branch: "main",
};

const grafana = (upstreamFile: string): GithubUpstreamSource => ({
	repo: { owner: "grafana", repo: "grafana-operator" },
	path: "deploy/helm/grafana-operator/files/crds",
	branch: "master",
	upstreamFile,
});

/** Single source of truth for all Observability CRD kinds, groups, and upstream sources. */
export const CRD_SOURCES = defineCrdSources({
	kinds: {
		servicemonitors: {
			file: "crd-servicemonitors.yaml",
			disableKey: "disableServiceMonitors",
			description: "Disable ServiceMonitor CRD",
			upstream: prometheusCommunity,
		},
		podmonitors: {
			file: "crd-podmonitors.yaml",
			disableKey: "disablePodMonitors",
			description: "Disable PodMonitor CRD",
			upstream: prometheusCommunity,
		},
		probes: {
			file: "crd-probes.yaml",
			disableKey: "disableProbes",
			description: "Disable Probe CRD",
			upstream: prometheusCommunity,
		},
		prometheusrules: {
			file: "crd-prometheusrules.yaml",
			disableKey: "disablePrometheusRules",
			description: "Disable PrometheusRule CRD",
			upstream: prometheusCommunity,
		},
		alertmanagerconfigs: {
			file: "crd-alertmanagerconfigs.yaml",
			disableKey: "disableAlertmanagerConfigs",
			description: "Disable AlertmanagerConfig CRD",
			upstream: prometheusCommunity,
		},
		alertmanagers: {
			file: "crd-alertmanagers.yaml",
			disableKey: "disableAlertmanagers",
			description: "Disable Alertmanager CRD",
			upstream: prometheusCommunity,
		},
		prometheuses: {
			file: "crd-prometheuses.yaml",
			disableKey: "disablePrometheuses",
			description: "Disable Prometheus CRD",
			upstream: prometheusCommunity,
		},
		prometheusagents: {
			file: "crd-prometheusagents.yaml",
			disableKey: "disablePrometheusAgents",
			description: "Disable PrometheusAgent CRD",
			upstream: prometheusCommunity,
		},
		scrapeconfigs: {
			file: "crd-scrapeconfigs.yaml",
			disableKey: "disableScrapeConfigs",
			description: "Disable ScrapeConfig CRD",
			upstream: prometheusCommunity,
		},
		thanosrulers: {
			file: "crd-thanosrulers.yaml",
			disableKey: "disableThanosRulers",
			description: "Disable ThanosRuler CRD",
			upstream: prometheusCommunity,
		},
		grafanas: {
			file: "crd-grafana-grafanas.yaml",
			disableKey: "disableGrafanas",
			description: "Disable Grafana CRD",
			upstream: grafana("grafana.integreatly.org_grafanas.yaml"),
		},
		grafanadashboards: {
			file: "crd-grafana-grafanadashboards.yaml",
			disableKey: "disableGrafanaDashboards",
			description: "Disable GrafanaDashboard CRD",
			upstream: grafana("grafana.integreatly.org_grafanadashboards.yaml"),
		},
		grafanadatasources: {
			file: "crd-grafana-grafanadatasources.yaml",
			disableKey: "disableGrafanaDatasources",
			description: "Disable GrafanaDatasource CRD",
			upstream: grafana("grafana.integreatly.org_grafanadatasources.yaml"),
		},
		grafanafolders: {
			file: "crd-grafana-grafanafolders.yaml",
			disableKey: "disableGrafanaFolders",
			description: "Disable GrafanaFolder CRD",
			upstream: grafana("grafana.integreatly.org_grafanafolders.yaml"),
		},
		grafanalibrarypanels: {
			file: "crd-grafana-grafanalibrarypanels.yaml",
			disableKey: "disableGrafanaLibraryPanels",
			description: "Disable GrafanaLibraryPanel CRD",
			upstream: grafana("grafana.integreatly.org_grafanalibrarypanels.yaml"),
		},
		grafanaserviceaccounts: {
			file: "crd-grafana-grafanaserviceaccounts.yaml",
			disableKey: "disableGrafanaServiceAccounts",
			description: "Disable GrafanaServiceAccount CRD",
			upstream: grafana("grafana.integreatly.org_grafanaserviceaccounts.yaml"),
		},
		grafanaalertrulegroups: {
			file: "crd-grafana-grafanaalertrulegroups.yaml",
			disableKey: "disableGrafanaAlertRuleGroups",
			description: "Disable GrafanaAlertRuleGroup CRD",
			upstream: grafana("grafana.integreatly.org_grafanaalertrulegroups.yaml"),
		},
		grafanacontactpoints: {
			file: "crd-grafana-grafanacontactpoints.yaml",
			disableKey: "disableGrafanaContactPoints",
			description: "Disable GrafanaContactPoint CRD",
			upstream: grafana("grafana.integreatly.org_grafanacontactpoints.yaml"),
		},
		grafanamanifests: {
			file: "crd-grafana-grafanamanifests.yaml",
			disableKey: "disableGrafanaManifests",
			description: "Disable GrafanaManifest CRD",
			upstream: grafana("grafana.integreatly.org_grafanamanifests.yaml"),
		},
		grafanamutetimings: {
			file: "crd-grafana-grafanamutetimings.yaml",
			disableKey: "disableGrafanaMuteTimings",
			description: "Disable GrafanaMuteTiming CRD",
			upstream: grafana("grafana.integreatly.org_grafanamutetimings.yaml"),
		},
		grafananotificationpolicies: {
			file: "crd-grafana-grafananotificationpolicies.yaml",
			disableKey: "disableGrafanaNotificationPolicies",
			description: "Disable GrafanaNotificationPolicy CRD",
			upstream: grafana(
				"grafana.integreatly.org_grafananotificationpolicies.yaml",
			),
		},
		grafananotificationpolicyroutes: {
			file: "crd-grafana-grafananotificationpolicyroutes.yaml",
			disableKey: "disableGrafanaNotificationPolicyRoutes",
			description: "Disable GrafanaNotificationPolicyRoute CRD",
			upstream: grafana(
				"grafana.integreatly.org_grafananotificationpolicyroutes.yaml",
			),
		},
		grafananotificationtemplates: {
			file: "crd-grafana-grafananotificationtemplates.yaml",
			disableKey: "disableGrafanaNotificationTemplates",
			description: "Disable GrafanaNotificationTemplate CRD",
			upstream: grafana(
				"grafana.integreatly.org_grafananotificationtemplates.yaml",
			),
		},
	},
	groups: {
		prometheus: {
			kinds: [
				"servicemonitors",
				"podmonitors",
				"probes",
				"prometheusrules",
				"alertmanagerconfigs",
				"alertmanagers",
				"prometheuses",
				"prometheusagents",
				"scrapeconfigs",
				"thanosrulers",
			],
			disableKey: "disablePrometheus",
			description: "Disable all Prometheus community CRDs",
		},
		grafana: {
			kinds: [
				"grafanas",
				"grafanadashboards",
				"grafanadatasources",
				"grafanafolders",
				"grafanalibrarypanels",
				"grafanaserviceaccounts",
				"grafanaalertrulegroups",
				"grafanacontactpoints",
				"grafanamanifests",
				"grafanamutetimings",
				"grafananotificationpolicies",
				"grafananotificationpolicyroutes",
				"grafananotificationtemplates",
			],
			disableKey: "disableGrafana",
			description: "Disable all Grafana operator CRDs",
		},
	},
});
