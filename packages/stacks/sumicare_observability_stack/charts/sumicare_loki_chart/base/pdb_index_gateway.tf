/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "loki_index_gateway" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["loki_index_gateway"]) : toset([])

  metadata {
    name      = "${local.app_name}-index-gateway"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.index_gateway_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_stateful_set.loki_index_gateway
  ]
}
