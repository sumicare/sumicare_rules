/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "argo_rollouts_notification_secret" {
  metadata {
    name      = "argo-rollouts-notification-secret"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "rollouts-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-rollouts"
      "app.kubernetes.io/part-of"    = "argo-rollouts"
      "app.kubernetes.io/version"    = "v1.8.3"
    }
  }

  data = {
    slack-token = "xxx"
  }

  type = "Opaque"
}

