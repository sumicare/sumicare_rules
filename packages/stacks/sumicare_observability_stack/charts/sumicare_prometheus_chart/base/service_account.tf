/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "prometheus_alertmanager" {
  metadata {
    name      = "prometheus-alertmanager"
    namespace = var.namespace
    labels    = local.alertmanager_labels
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "prometheus_kube_state_metrics" {
  metadata {
    name      = "prometheus-kube-state-metrics"
    namespace = var.namespace

    labels = local.kube_state_metrics_labels
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "prometheus_prometheus_node_exporter" {
  metadata {
    name      = "prometheus-prometheus-node-exporter"
    namespace = var.namespace

    labels = local.node_exporter_labels
  }
}

resource "kubernetes_service_account" "prometheus_prometheus_pushgateway" {
  metadata {
    name      = "prometheus-prometheus-pushgateway"
    namespace = var.namespace

    labels = local.pushgateway_labels
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "prometheus_server" {
  metadata {
    name      = "prometheus-server"
    namespace = var.namespace

    labels = local.server_labels
  }
}

