/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "release_name_rollout_operator" {
  metadata {
    name      = "release-name-rollout-operator"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "rollout-operator"
      "app.kubernetes.io/version"    = "v0.29.0"
    }
  }
}

resource "kubernetes_service_account" "release_name_loki" {
  metadata {
    name      = "release-name-loki"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  automount_service_account_token = true
}

