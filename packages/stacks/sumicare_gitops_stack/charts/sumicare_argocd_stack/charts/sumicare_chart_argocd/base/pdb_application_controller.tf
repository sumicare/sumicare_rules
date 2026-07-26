/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "application_controller" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["application_controller"]) : toset([])

  metadata {
    name      = "${local.app_name}-application-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.application_controller_labels
    }

    max_unavailable = ceil(var.application_controller_replicas / 2)
  }

  depends_on = [
    kubernetes_stateful_set.argocd_application_controller
  ]
}
