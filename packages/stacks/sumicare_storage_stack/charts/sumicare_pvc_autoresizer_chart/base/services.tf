/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "pvc_autoresizer_controller" {
  metadata {
    name      = "pvc-autoresizer-controller"
    namespace = var.namespace
  }

  spec {
    port {
      port        = 443
      target_port = "9443"
    }

    selector = {
      "app.kubernetes.io/instance" = "pvc-autoresizer"
      "app.kubernetes.io/name"     = "pvc-autoresizer"
    }
  }
}

