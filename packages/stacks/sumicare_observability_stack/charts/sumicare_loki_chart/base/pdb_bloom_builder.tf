/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "loki_bloom_builder" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["loki_bloom_builder"]) : toset([])

  metadata {
    name      = "${local.app_name}-bloom-builder"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.bloom_builder_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_deployment.loki_bloom_builder
  ]
}
