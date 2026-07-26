/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_manifest" "scaledobject_ballista_executor" {
  manifest = {
    apiVersion = "keda.sh/v1alpha1"
    kind       = "ScaledObject"
    metadata = {
      name      = "${local.app_name}-executor"
      namespace = var.namespace
    }
    spec = {
      maxReplicaCount = 5
      minReplicaCount = 0
      scaleTargetRef = {
        name = "${local.app_name}-executor"
      }
      triggers = [
        {
          metadata = {
            scalerAddress = "${local.app_name}-scheduler.${var.namespace}.svc.${var.cluster_domain}:50050"
          }
          type = "external"
        }
      ]
    }
  }
}
