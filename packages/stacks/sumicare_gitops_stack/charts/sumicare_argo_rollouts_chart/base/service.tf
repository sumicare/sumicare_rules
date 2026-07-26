/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_argo_rollouts_metrics" {
  metadata {
    name      = "release-name-argo-rollouts-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "rollouts-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-rollouts"
      "app.kubernetes.io/part-of"    = "argo-rollouts"
      "app.kubernetes.io/version"    = "v1.8.3"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8090
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/component" = "rollouts-controller"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "argo-rollouts"
    }
  }
}

resource "kubernetes_service" "release_name_argo_rollouts_dashboard" {
  metadata {
    name      = "release-name-argo-rollouts-dashboard"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "rollouts-dashboard"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-rollouts"
      "app.kubernetes.io/part-of"    = "argo-rollouts"
      "app.kubernetes.io/version"    = "v1.8.3"
    }
  }

  spec {
    port {
      name        = "dashboard"
      protocol    = "TCP"
      port        = 3100
      target_port = "dashboard"
    }

    selector = {
      "app.kubernetes.io/component" = "rollouts-dashboard"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "argo-rollouts"
    }

    type = "ClusterIP"
  }
}

