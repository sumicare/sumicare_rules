/*
 * Copyright (c) 2026 Sumicare Contributors
 *
 * Licensed under the terms of MIT License
 */

export { Alertmanager as PrometheusAlertmanager } from "Observability/Crds/Imports/alertmanager-monitoring.coreos.com";
export { AlertmanagerConfig as PrometheusAlertmanagerConfig } from "Observability/Crds/Imports/alertmanagerconfig-monitoring.coreos.com"; // v1alpha1
export { Grafana } from "Observability/Crds/Imports/grafana-grafana.integreatly.org"; // v1beta1
export { GrafanaAlertRuleGroup } from "Observability/Crds/Imports/grafanaalertrulegroup-grafana.integreatly.org"; // v1beta1
export { GrafanaContactPoint } from "Observability/Crds/Imports/grafanacontactpoint-grafana.integreatly.org"; // v1beta1
export { GrafanaDashboard } from "Observability/Crds/Imports/grafanadashboard-grafana.integreatly.org"; // v1beta1
export { GrafanaDatasource } from "Observability/Crds/Imports/grafanadatasource-grafana.integreatly.org"; // v1beta1
export { GrafanaFolder } from "Observability/Crds/Imports/grafanafolder-grafana.integreatly.org"; // v1beta1
export { GrafanaLibraryPanel } from "Observability/Crds/Imports/grafanalibrarypanel-grafana.integreatly.org"; // v1beta1
export { GrafanaManifest } from "Observability/Crds/Imports/grafanamanifest-grafana.integreatly.org"; // v1beta1
export { GrafanaMuteTiming } from "Observability/Crds/Imports/grafanamutetiming-grafana.integreatly.org"; // v1beta1
export { GrafanaNotificationPolicy } from "Observability/Crds/Imports/grafananotificationpolicy-grafana.integreatly.org"; // v1beta1
export { GrafanaNotificationPolicyRoute } from "Observability/Crds/Imports/grafananotificationpolicyroute-grafana.integreatly.org"; // v1beta1
export { GrafanaNotificationTemplate } from "Observability/Crds/Imports/grafananotificationtemplate-grafana.integreatly.org"; // v1beta1
export { GrafanaServiceAccount } from "Observability/Crds/Imports/grafanaserviceaccount-grafana.integreatly.org"; // v1beta1
export { PodMonitor as PrometheusPodMonitor } from "Observability/Crds/Imports/podmonitor-monitoring.coreos.com";
export { Probe as PrometheusProbe } from "Observability/Crds/Imports/probe-monitoring.coreos.com";
export { Prometheus } from "Observability/Crds/Imports/prometheus-monitoring.coreos.com";
export { PrometheusAgent } from "Observability/Crds/Imports/prometheusagent-monitoring.coreos.com"; // v1alpha1
export { PrometheusRule } from "Observability/Crds/Imports/prometheusrule-monitoring.coreos.com";
export { ScrapeConfig as PrometheusScrapeConfig } from "Observability/Crds/Imports/scrapeconfig-monitoring.coreos.com"; // v1alpha1
export {
	ServiceMonitor as PrometheusServiceMonitor,
	ServiceMonitorSpecEndpointsMetricRelabelingsAction as PrometheusServiceMonitorMetricRelabelingsAction,
	ServiceMonitorSpecEndpointsRelabelingsAction as PrometheusServiceMonitorRelabelingsAction,
	ServiceMonitorSpecEndpointsScheme as PrometheusServiceMonitorEndpointScheme,
} from "Observability/Crds/Imports/servicemonitor-monitoring.coreos.com";
export { ThanosRuler as PrometheusThanosRuler } from "Observability/Crds/Imports/thanosruler-monitoring.coreos.com";
