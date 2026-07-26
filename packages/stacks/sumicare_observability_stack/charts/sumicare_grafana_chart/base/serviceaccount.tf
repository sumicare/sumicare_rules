/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }
}

resource "kubernetes_service_account" "grafana_test" {
  metadata {
    name      = "release-name-grafana-test"
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }

    annotations = {
      "helm.sh/hook"               = "test"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded"
    }
  }
}

