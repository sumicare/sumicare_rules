/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

locals {
  app_name = "prometheus"

  labels = {
    "app.kubernetes.io/instance" = "${var.org}-${var.env}"
    "app.kubernetes.io/part-of"  = local.app_name
    "app.kubernetes.io/version"  = var.prometheus_version
    "app.kubernetes.io/org"      = var.org
    "app.kubernetes.io/env"      = var.env
  }

  server_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}"
    "app.kubernetes.io/component" = "server"
  })

  alertmanager_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-alertmanager"
    "app.kubernetes.io/component" = "alertmanager"
  })

  kube_state_metrics_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-kube-state-metrics"
    "app.kubernetes.io/component" = "metrics"
  })

  node_exporter_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-node-exporter"
    "app.kubernetes.io/component" = "metrics"
  })

  pushgateway_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-pushgateway"
    "app.kubernetes.io/component" = "pushgateway"
  })
}
