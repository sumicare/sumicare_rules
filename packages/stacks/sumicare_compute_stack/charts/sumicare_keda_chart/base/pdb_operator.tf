/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_pod_disruption_budget" "keda_operator" {
  for_each = contains(["prod", "staging"], var.env) ? toset(["keda_operator"]) : toset([])

  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = local.operator_labels
    }

    max_unavailable = ceil(var.operator_replicas / 2)
  }

  depends_on = [
    kubernetes_deployment.keda_operator
  ]
}
