/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "tekton_operator" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 9090
      target_port = "9090"
    }

    selector = local.operator_labels
  }
}

resource "kubernetes_service" "tekton_operator_webhook" {
  metadata {
    name      = "${local.app_name}-webhook"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "https-webhook"
      port        = 443
      target_port = "8443"
    }

    selector = local.webhook_labels
  }
}
