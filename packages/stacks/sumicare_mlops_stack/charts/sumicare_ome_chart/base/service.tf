/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "ome_webhook_server_service" {
  metadata {
    name      = "ome-webhook-server-service"
    namespace = "ome"
  }

  spec {
    port {
      port        = 443
      target_port = "webhook-server"
    }

    selector = {
      control-plane = "ome-controller-manager"
    }
  }
}

resource "kubernetes_service" "ome_controller_manager_service" {
  metadata {
    name      = "ome-controller-manager-service"
    namespace = "ome"

    labels = {
      control-plane             = "ome-controller-manager"
      "controller-tools.k8s.io" = "1.0"
    }
  }

  spec {
    port {
      protocol    = "TCP"
      port        = 8443
      target_port = "https"
    }

    selector = {
      control-plane             = "ome-controller-manager"
      "controller-tools.k8s.io" = "1.0"
    }
  }
}

