/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "keda_metrics_server" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["keda_metrics_server"]) : toset([])

  metadata {
    name      = "${local.app_name}-metrics-apiserver"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.metrics_server_labels
    }

    max_unavailable = ceil(var.metrics_server_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.keda_operator_metrics_apiserver
  ]
}
