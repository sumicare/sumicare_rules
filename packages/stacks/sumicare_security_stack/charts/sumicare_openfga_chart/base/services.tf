/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "openfga" {
  metadata {
    name = "openfga"

    labels = {
      "app.kubernetes.io/component"  = "authorization-controller"
      "app.kubernetes.io/instance"   = "openfga"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "openfga"
      "app.kubernetes.io/part-of"    = "openfga"
      "app.kubernetes.io/version"    = "v1.11.6"
      "helm.sh/chart"                = "openfga-0.2.55"
    }
  }

  spec {
    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 8081
      target_port = "grpc"
    }

    port {
      name        = "http"
      protocol    = "TCP"
      port        = 8080
      target_port = "http"
    }

    port {
      name        = "playground"
      protocol    = "TCP"
      port        = 3000
      target_port = "playground"
    }

    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 2112
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "openfga"
      "app.kubernetes.io/name"     = "openfga"
    }

    type = "ClusterIP"
  }
}

