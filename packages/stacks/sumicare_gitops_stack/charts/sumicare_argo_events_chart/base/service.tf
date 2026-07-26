/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_argo_events_controller_manager_metrics" {
  metadata {
    name      = "release-name-argo-events-controller-manager-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "controller-manager"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-events-controller-manager-metrics"
      "app.kubernetes.io/part-of"    = "argo-events"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8082
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argo-events-controller-manager"
    }
  }
}

resource "kubernetes_service" "events_webhook" {
  metadata {
    name      = "events-webhook"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-events-events-webhook"
      "app.kubernetes.io/part-of"    = "argo-events"
    }
  }

  spec {
    port {
      port        = 443
      target_port = "webhook"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argo-events-events-webhook"
    }
  }
}

