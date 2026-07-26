/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "events_webhook" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["events_webhook"]) : toset([])

  metadata {
    name      = "${local.app_name}-events-webhook"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.webhook_labels
    }

    max_unavailable = ceil(var.webhook_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.events_webhook
  ]
}
