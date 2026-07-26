/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_external_dns" {
  metadata {
    name      = "release-name-external-dns"
    namespace = "external-dns"

    labels = {
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "external-dns"
      "app.kubernetes.io/version"    = "0.19.0"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 7979
      target_port = "http"
    }

    selector = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "external-dns"
    }

    type = "ClusterIP"
  }
}

