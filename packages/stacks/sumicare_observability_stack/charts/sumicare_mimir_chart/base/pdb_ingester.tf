/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_ingester" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_ingester"]) : toset([])

  metadata {
    name      = "${local.app_name}-ingester"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.ingester_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_stateful_set.mimir_ingester_zone_a,
    kubernetes_stateful_set.mimir_ingester_zone_b,
    kubernetes_stateful_set.mimir_ingester_zone_c
  ]
}
