/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "pvc_autoresizer_controller" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["pvc_autoresizer_controller"]) : toset([])

  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.controller_labels
    }

    max_unavailable = ceil(var.replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.pvc_autoresizer_controller
  ]
}
