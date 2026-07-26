/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }

  spec {
    port {
      name        = "service"
      protocol    = "TCP"
      port        = 80
      target_port = local.app_name
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
    }

    type = "ClusterIP"
  }
}

