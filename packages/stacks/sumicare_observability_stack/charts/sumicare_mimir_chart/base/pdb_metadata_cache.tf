/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_metadata_cache" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_metadata_cache"]) : toset([])

  metadata {
    name      = "${local.app_name}-metadata-cache"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.metadata_cache_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_stateful_set.mimir_metadata_cache
  ]
}
