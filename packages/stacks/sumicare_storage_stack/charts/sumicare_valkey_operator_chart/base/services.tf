/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "valkey_operator" {
  metadata {
    name = "valkey-operator"

    labels = {
      "app.kubernetes.io/instance"   = "valkey-operator"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "valkey-operator"
      "app.kubernetes.io/version"    = "v0.1.10"
      "helm.sh/chart"                = "valkey-operator-0.1.13"
    }
  }

  spec {
    port {
      name        = "https"
      protocol    = "TCP"
      port        = 443
      target_port = "webhook"
    }

    selector = {
      "app.kubernetes.io/instance" = "valkey-operator"
      "app.kubernetes.io/name"     = "valkey-operator"
    }

    type = "ClusterIP"
  }
}

