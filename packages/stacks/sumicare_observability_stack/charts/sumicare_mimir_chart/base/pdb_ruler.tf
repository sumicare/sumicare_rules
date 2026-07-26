/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_ruler" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_ruler"]) : toset([])

  metadata {
    name      = "${local.app_name}-ruler"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.ruler_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_deployment.mimir_ruler
  ]
}
