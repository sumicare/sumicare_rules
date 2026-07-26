/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "notifications_controller" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["notifications_controller"]) : toset([])

  metadata {
    name      = "${local.app_name}-notifications-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.notifications_controller_labels
    }

    max_unavailable = ceil(var.notifications_controller_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.notifications_controller
  ]
}
