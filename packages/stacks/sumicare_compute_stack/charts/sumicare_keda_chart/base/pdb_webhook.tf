/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "keda_webhook" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["keda_webhook"]) : toset([])

  metadata {
    name      = "${local.app_name}-admission-webhooks"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.webhook_labels
    }

    max_unavailable = ceil(var.webhooks_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.keda_admission_webhook
  ]
}
