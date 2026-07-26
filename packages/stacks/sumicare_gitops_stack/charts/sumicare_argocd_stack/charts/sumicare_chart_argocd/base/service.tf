/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_argocd_application_controller_metrics" {
  metadata {
    name      = "release-name-argocd-application-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-metrics"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 8082
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-application-controller"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_applicationset_controller_metrics" {
  metadata {
    name      = "release-name-argocd-applicationset-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "applicationset-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-metrics"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 8080
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-applicationset-controller"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_applicationset_controller" {
  metadata {
    name      = "release-name-argocd-applicationset-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "applicationset-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-applicationset-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-webhook"
      port        = 7000
      target_port = "webhook"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-applicationset-controller"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_notifications_controller_metrics" {
  metadata {
    name      = "release-name-argocd-notifications-controller-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-metrics"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 9001
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-notifications-controller"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_repo_server_metrics" {
  metadata {
    name      = "release-name-argocd-repo-server-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "repo-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-repo-server-metrics"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 8084
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-repo-server"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_repo_server" {
  metadata {
    name      = "release-name-argocd-repo-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "repo-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-repo-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "tcp-repo-server"
      protocol    = "TCP"
      port        = 8081
      target_port = "repo-server"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-repo-server"
    }
  }
}

resource "kubernetes_service" "release_name_argocd_server_metrics" {
  metadata {
    name      = "release-name-argocd-server-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server-metrics"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 8083
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-server"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_argocd_server" {
  metadata {
    name      = "release-name-argocd-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 80
      target_port = "8080"
    }

    port {
      name        = "https"
      protocol    = "TCP"
      port        = 443
      target_port = "8080"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-server"
    }

    type             = "ClusterIP"
    session_affinity = "None"
  }
}

resource "kubernetes_service" "release_name_argocd_dex_server" {
  metadata {
    name      = "release-name-argocd-dex-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "dex-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-dex-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 5556
      target_port = "http"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 5557
      target_port = "grpc"
    }

    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 5558
      target_port = "metrics"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argocd-dex-server"
    }
  }
}

