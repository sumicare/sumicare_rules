/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name         = "http"
      protocol     = "TCP"
      app_protocol = "http"
      port         = var.http_port
      target_port  = "http"
    }

    port {
      name         = "telemetry"
      protocol     = "TCP"
      app_protocol = "http"
      port         = var.telemetry_port
      target_port  = "telemetry"
    }

    selector = local.selector_labels
    type     = "ClusterIP"
  }
}
