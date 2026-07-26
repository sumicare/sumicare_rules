/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "kubearmor" {
  metadata {
    name      = "kubearmor"
    namespace = var.namespace

    labels = {
      kubearmor-app = "kubearmor-relay"
    }
  }

  spec {
    port {
      protocol    = "TCP"
      port        = 32767
      target_port = "32767"
    }

    selector = {
      kubearmor-app = "kubearmor-relay"
    }
  }
}

resource "kubernetes_service" "kubearmor_controller_webhook_service" {
  metadata {
    name      = "kubearmor-controller-webhook-service"
    namespace = var.namespace
  }

  spec {
    port {
      protocol    = "TCP"
      port        = 443
      target_port = "9443"
    }

    selector = {
      kubearmor-app = "kubearmor-controller"
    }
  }
}

