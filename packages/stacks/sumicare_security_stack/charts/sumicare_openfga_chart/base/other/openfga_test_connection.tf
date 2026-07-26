/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_pod" "openfga_test_connection" {
  metadata {
    name = "openfga-test-connection"

    labels = {
      "app.kubernetes.io/component"  = "authorization-controller"
      "app.kubernetes.io/instance"   = "openfga"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "openfga"
      "app.kubernetes.io/part-of"    = "openfga"
      "app.kubernetes.io/version"    = "v1.11.6"
      "helm.sh/chart"                = "openfga-0.2.55"
    }

    annotations = {
      "helm.sh/hook" = "test"
    }
  }

  spec {
    container {
      name              = "grpc-health-probe"
      image             = "openfga/openfga:v1.11.6"
      command           = ["grpc_health_probe", "-addr=openfga:8081"]
      image_pull_policy = "Always"
    }

    restart_policy = "Never"
  }
}

