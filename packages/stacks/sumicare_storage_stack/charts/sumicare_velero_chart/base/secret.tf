/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "velero" {
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

  type = "Opaque"
}

