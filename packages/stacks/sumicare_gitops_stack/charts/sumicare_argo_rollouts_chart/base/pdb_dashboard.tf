/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "dashboard" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["dashboard"]) : toset([])

  metadata {
    name      = "${local.app_name}-dashboard"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.dashboard_labels
    }

    max_unavailable = ceil(var.dashboard_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.argo_rollouts_dashboard
  ]
}
