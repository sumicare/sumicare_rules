/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_persistent_volume_claim" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }

    finalizers = ["kubernetes.io/pvc-protection"]
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "10Gi"
      }
    }
  }
}

