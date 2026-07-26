/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_querier" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_querier"]) : toset([])

  metadata {
    name      = "${local.app_name}-querier"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.querier_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_deployment.mimir_querier
  ]
}
