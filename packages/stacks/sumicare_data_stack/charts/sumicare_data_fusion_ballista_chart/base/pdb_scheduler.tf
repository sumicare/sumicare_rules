/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "ballista_scheduler" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["ballista_scheduler"]) : toset([])

  metadata {
    name      = "${local.app_name}-scheduler"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.scheduler_labels
    }

    max_unavailable = ceil(var.replicas / 2)
  }
}
