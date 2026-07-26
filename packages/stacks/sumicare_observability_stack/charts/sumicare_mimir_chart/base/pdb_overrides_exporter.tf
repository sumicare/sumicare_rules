/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "mimir_overrides_exporter" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["mimir_overrides_exporter"]) : toset([])

  metadata {
    name      = "${local.app_name}-overrides-exporter"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.overrides_exporter_labels
    }

    max_unavailable = 1
  }

  depends_on = [
    kubernetes_deployment.mimir_overrides_exporter
  ]
}
