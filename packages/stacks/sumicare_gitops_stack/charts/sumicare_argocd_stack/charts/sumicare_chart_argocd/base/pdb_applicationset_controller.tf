/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "applicationset_controller" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["applicationset_controller"]) : toset([])

  metadata {
    name      = "${local.app_name}-applicationset-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.applicationset_controller_labels
    }

    max_unavailable = ceil(var.applicationset_controller_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.applicationset_controller
  ]
}
