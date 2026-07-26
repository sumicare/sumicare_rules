/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role_binding" "release_name_argo_workflows_workflow_controller" {
  metadata {
    name = "release-name-argo-workflows-workflow-controller"

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-argo-workflows-workflow-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argo-workflows-workflow-controller"
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argo_workflows_workflow_controller_cluster_template" {
  metadata {
    name = "release-name-argo-workflows-workflow-controller-cluster-template"

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-argo-workflows-workflow-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argo-workflows-workflow-controller-cluster-template"
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argo_workflows_server" {
  metadata {
    name = "release-name-argo-workflows-server"

    labels = {
      app                            = "server"
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-server"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-argo-workflows-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argo-workflows-server"
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argo_workflows_server_cluster_template" {
  metadata {
    name = "release-name-argo-workflows-server-cluster-template"

    labels = {
      app                            = "server"
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-server"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-argo-workflows-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argo-workflows-server-cluster-template"
  }
}

resource "kubernetes_role" "release_name_argo_workflows_workflow" {
  metadata {
    name      = "release-name-argo-workflows-workflow"
    namespace = "default"

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = ["argoproj.io"]
    resources  = ["workflowtaskresults"]
  }
}

resource "kubernetes_role" "release_name_argo_workflows_workflow" {
  metadata {
    name      = "release-name-argo-workflows-workflow"
    namespace = var.namespace

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = ["argoproj.io"]
    resources  = ["workflowtaskresults"]
  }
}

resource "kubernetes_role_binding" "release_name_argo_workflows_workflow" {
  metadata {
    name      = "release-name-argo-workflows-workflow"
    namespace = "default"

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argo-workflow"
    namespace = "default"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argo-workflows-workflow"
  }
}

resource "kubernetes_role_binding" "release_name_argo_workflows_workflow" {
  metadata {
    name      = "release-name-argo-workflows-workflow"
    namespace = var.namespace

    labels = {
      app                            = "workflow-controller"
      "app.kubernetes.io/component"  = "workflow-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argo-workflows-workflow-controller"
      "app.kubernetes.io/part-of"    = "argo-workflows"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argo-workflow"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argo-workflows-workflow"
  }
}

