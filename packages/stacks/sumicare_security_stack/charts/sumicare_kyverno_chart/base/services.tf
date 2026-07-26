/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "kyverno_svc" {
  metadata {
    name      = "kyverno-svc"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name         = "https"
      protocol     = "TCP"
      app_protocol = "https"
      port         = 443
      target_port  = "https"
    }

    selector = {
      "app.kubernetes.io/component" = "admission-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "kyverno_svc_metrics" {
  metadata {
    name      = "kyverno-svc-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name        = "metrics-port"
      protocol    = "TCP"
      port        = 8000
      target_port = "8000"
    }

    selector = {
      "app.kubernetes.io/component" = "admission-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "kyverno_background_controller_metrics" {
  metadata {
    name      = "kyverno-background-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name        = "metrics-port"
      protocol    = "TCP"
      port        = 8000
      target_port = "8000"
    }

    selector = {
      "app.kubernetes.io/component" = "background-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "kyverno_cleanup_controller" {
  metadata {
    name      = "kyverno-cleanup-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name         = "https"
      protocol     = "TCP"
      app_protocol = "https"
      port         = 443
      target_port  = "https"
    }

    selector = {
      "app.kubernetes.io/component" = "cleanup-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "kyverno_cleanup_controller_metrics" {
  metadata {
    name      = "kyverno-cleanup-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name        = "metrics-port"
      protocol    = "TCP"
      port        = 8000
      target_port = "8000"
    }

    selector = {
      "app.kubernetes.io/component" = "cleanup-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "kyverno_reports_controller_metrics" {
  metadata {
    name      = "kyverno-reports-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  spec {
    port {
      name        = "metrics-port"
      protocol    = "TCP"
      port        = 8000
      target_port = "8000"
    }

    selector = {
      "app.kubernetes.io/component" = "reports-controller"
      "app.kubernetes.io/instance"  = "kyverno"
      "app.kubernetes.io/part-of"   = "kyverno"
    }

    type = "ClusterIP"
  }
}

