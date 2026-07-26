/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "release_name_argo_events_controller_manager" {
  metadata {
    name      = "release-name-argo-events-controller-manager"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "controller-manager"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-events-controller-manager"
      "app.kubernetes.io/part-of"    = "argo-events"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "release_name_argo_events_events_webhook" {
  metadata {
    name      = "release-name-argo-events-events-webhook"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "events-webhook"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-events-events-webhook"
      "app.kubernetes.io/part-of"    = "argo-events"
    }
  }

  automount_service_account_token = true
}

