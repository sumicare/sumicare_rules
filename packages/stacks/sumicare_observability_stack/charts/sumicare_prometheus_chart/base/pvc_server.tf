/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_persistent_volume_claim" "prometheus_server" {
  metadata {
    name      = "prometheus-server"
    namespace = var.namespace

    labels = local.server_labels
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "8Gi"
      }
    }
  }
}

