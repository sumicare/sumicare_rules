/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "release_name_minio" {
  metadata {
    name      = "release-name-minio"
    namespace = var.namespace

    labels = {
      app      = "minio"
      chart    = "minio-4.0.12"
      heritage = "Helm"
      release  = "${var.org}-${var.env}"
    }
  }

  data = {
    rootPassword = "supersecret"
    rootUser     = "grafana-tempo"
  }

  type = "Opaque"
}

