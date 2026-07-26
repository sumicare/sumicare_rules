/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "dex_server" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["dex_server"]) : toset([])

  metadata {
    name      = "${local.app_name}-dex-server"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.dex_server_labels
    }

    max_unavailable = ceil(var.dex_server_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.dex_server
  ]
}
