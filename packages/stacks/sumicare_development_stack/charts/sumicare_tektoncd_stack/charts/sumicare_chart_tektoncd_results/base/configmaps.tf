/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_config_map" "config_logging" {
  metadata {
    name      = "config-logging"
    namespace = var.namespace
    labels    = local.labels
  }

  data = yamldecode(file("${path.module}/configs/config-logging.yaml"))
}

resource "kubernetes_config_map" "tekton_config_defaults" {
  metadata {
    name      = "tekton-config-defaults"
    namespace = var.namespace
    labels    = local.labels
  }

  data = yamldecode(file("${path.module}/configs/tekton-config-defaults.yaml"))
}

resource "kubernetes_config_map" "tekton_config_observability" {
  metadata {
    name      = "tekton-config-observability"
    namespace = var.namespace
    labels    = local.labels
  }

  data = yamldecode(file("${path.module}/configs/tekton-config-observability.yaml"))
}

resource "kubernetes_config_map" "tekton_operator_controller_config_leader_election" {
  metadata {
    name      = "${local.app_name}-controller-config-leader-election"
    namespace = var.namespace
    labels    = local.labels
  }

  data = yamldecode(file("${path.module}/configs/controller-config-leader-election.yaml"))
}

resource "kubernetes_config_map" "tekton_operator_info" {
  metadata {
    name      = "${local.app_name}-info"
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    version = "v${var.tekton_operator_version}"
  }
}

resource "kubernetes_config_map" "tekton_operator_webhook_config_leader_election" {
  metadata {
    name      = "${local.app_name}-webhook-config-leader-election"
    namespace = var.namespace
    labels    = local.labels
  }

  data = yamldecode(file("${path.module}/configs/webhook-config-leader-election.yaml"))
}
