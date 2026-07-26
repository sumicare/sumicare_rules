/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_config_map" "release_name_admission_configmap" {
  metadata {
    name      = "release-name-admission-configmap"
    namespace = var.namespace
  }

  data = {
    "volcano-admission.conf" = file("${path.module}/conf/volcano-admission.conf")
  }
}

resource "kubernetes_config_map" "release_name_controller_configmap" {
  metadata {
    name      = "release-name-controller-configmap"
    namespace = var.namespace
  }

  data = {
    "volcano-controller.conf" = file("${path.module}/conf/volcano-controller.conf")
  }
}

resource "kubernetes_config_map" "grafana_datasources" {
  metadata {
    name      = "grafana-datasources"
    namespace = var.namespace
  }

  data = {
    "prometheus.yaml" = file("${path.module}/conf/prometheus.yaml")
  }
}

resource "kubernetes_config_map" "grafana_release_name_dashboard_config" {
  metadata {
    name      = "grafana-release-name-dashboard-config"
    namespace = var.namespace
  }

  data = {
    "dashboard.yaml" = file("${path.module}/conf/dashboard.yaml")
  }
}

resource "kubernetes_config_map" "grafana_release_name_dashboard" {
  metadata {
    name      = "grafana-release-name-dashboard"
    namespace = var.namespace
  }

  data = {
    "volcano-global-overview-dashboard.json"    = file("${path.module}/conf/volcano-global-overview-dashboard.json")
    "volcano-namespace-overview-dashboard.json" = file("${path.module}/conf/volcano-namespace-overview-dashboard.json")
    "volcano-queue-overview-dashboard.json"     = file("${path.module}/conf/volcano-queue-overview-dashboard.json")
  }
}

resource "kubernetes_config_map" "prometheus_server_conf" {
  metadata {
    name      = "prometheus-server-conf"
    namespace = var.namespace

    labels = {
      name = "prometheus-server-conf"
    }
  }

  data = {
    "prometheus.yml" = file("${path.module}/conf/prometheus.yml")
  }
}

resource "kubernetes_config_map" "release_name_scheduler_configmap" {
  metadata {
    name      = "release-name-scheduler-configmap"
    namespace = var.namespace
  }

  data = {
    "volcano-scheduler.conf" = file("${path.module}/conf/volcano-scheduler.conf")
  }
}
