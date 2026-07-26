/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "prometheus_alertmanager" {
  metadata {
    name      = "prometheus-alertmanager"
    namespace = var.namespace

    labels = local.alertmanager_labels
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 9093
      target_port = "http"
    }

    selector = local.alertmanager_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "prometheus_alertmanager_headless" {
  metadata {
    name      = "prometheus-alertmanager-headless"
    namespace = var.namespace

    labels = local.alertmanager_labels
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 9093
      target_port = "http"
    }

    selector = local.alertmanager_labels

    cluster_ip = "None"
  }
}

resource "kubernetes_service" "prometheus_kube_state_metrics" {
  metadata {
    name      = "prometheus-kube-state-metrics"
    namespace = var.namespace

    labels = local.kube_state_metrics_labels

    annotations = {
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 8080
      target_port = "http"
    }

    selector = local.kube_state_metrics_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "prometheus_prometheus_node_exporter" {
  metadata {
    name      = "prometheus-prometheus-node-exporter"
    namespace = var.namespace

    labels = local.node_exporter_labels

    annotations = {
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 9100
      target_port = "9100"
    }

    selector = local.node_exporter_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "prometheus_prometheus_pushgateway" {
  metadata {
    name      = "prometheus-prometheus-pushgateway"
    namespace = var.namespace

    labels = local.pushgateway_labels

    annotations = {
      "prometheus.io/probe" = "pushgateway"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 9091
      target_port = "9091"
    }

    selector = local.pushgateway_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "prometheus_server" {
  metadata {
    name      = "prometheus-server"
    namespace = var.namespace

    labels = local.server_labels
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 80
      target_port = "9090"
    }

    selector = local.server_labels

    type             = "ClusterIP"
    session_affinity = "None"
  }
}

