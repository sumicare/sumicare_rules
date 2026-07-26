/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_store_gateway" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_store_gateway"]) : toset([])

  metadata {
    name      = "${local.app_name}-store-gateway"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.store_gateway_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_stateful_set.mimir_store_gateway_zone_a,
    kubernetes_stateful_set.mimir_store_gateway_zone_b,
    kubernetes_stateful_set.mimir_store_gateway_zone_c
  ]
}
