/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "repo_server" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["repo_server"]) : toset([])

  metadata {
    name      = "${local.app_name}-repo-server"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.repo_server_labels
    }

    max_unavailable = ceil(var.repo_server_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.repo_server
  ]
}
