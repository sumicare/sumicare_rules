/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "release_name_minio" {
  metadata {
    name = "release-name-minio"

    labels = {
      app      = "minio"
      chart    = "minio-5.4.0"
      heritage = "Helm"
      release  = "${var.org}-${var.env}"
    }
  }

  data = {
    rootPassword = "supersecret"
    rootUser     = "grafana-mimir"
  }

  type = "Opaque"
}

resource "kubernetes_secret" "release_name_mimir_logs_instance_usernames" {
  metadata {
    name      = "release-name-mimir-logs-instance-usernames"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "meta-monitoring"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "mimir"
      "app.kubernetes.io/version"    = "3.0.0"
    }
  }
}

resource "kubernetes_secret" "release_name_mimir_metrics_instance_usernames" {
  metadata {
    name      = "release-name-mimir-metrics-instance-usernames"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "meta-monitoring"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "mimir"
      "app.kubernetes.io/version"    = "3.0.0"
    }
  }
}

