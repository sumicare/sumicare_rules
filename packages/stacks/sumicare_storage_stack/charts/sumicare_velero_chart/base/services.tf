/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "velero" {
  metadata {
    name      = "velero"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "velero"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "velero"
      "helm.sh/chart"                = "velero-11.4.0"
    }
  }

  spec {
    port {
      name        = "http-monitoring"
      port        = 8085
      target_port = "http-monitoring"
    }

    selector = {
      "app.kubernetes.io/instance" = "velero"
      "app.kubernetes.io/name"     = "velero"
      name                         = "velero"
    }

    type = "ClusterIP"
  }
}

