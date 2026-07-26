/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_argo_workflows_workflow_controller" {
  metadata {
    name      = "release-name-argo-workflows-workflow-controller"
    namespace = var.namespace

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
      "app.kubernetes.io/version"    = "v3.7.3"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8080
      target_port = "9090"
    }

    port {
      name        = "telemetry"
      protocol    = "TCP"
      port        = 8081
      target_port = "8081"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argo-workflows-workflow-controller"
    }

    type             = "ClusterIP"
    session_affinity = "None"
  }
}

resource "kubernetes_service" "release_name_argo_workflows_server" {
  metadata {
    name      = "release-name-argo-workflows-server"
    namespace = var.namespace

    labels = {
      app                            = "server"
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-server"
      "app.kubernetes.io/part-of"    = "argo-workflows"
      "app.kubernetes.io/version"    = "v3.7.3"
    }
  }

  spec {
    port {
      port        = 2746
      target_port = "2746"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "argo-workflows-server"
    }

    type             = "ClusterIP"
    session_affinity = "None"
  }
}

