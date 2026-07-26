/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "release_name_argocd_application_controller" {
  metadata {
    name = "release-name-argocd-application-controller"

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-application-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  rule {
    verbs      = ["*"]
    api_groups = ["*"]
    resources  = ["*"]
  }

  rule {
    verbs             = ["*"]
    non_resource_urls = ["*"]
  }
}

resource "kubernetes_cluster_role" "release_name_argocd_notifications_controller" {
  metadata {
    name = "release-name-argocd-notifications-controller"

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  rule {
    verbs      = ["get", "list", "watch", "update", "patch"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "appprojects"]
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "secrets"]
  }

  rule {
    verbs          = ["get"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["argocd-notifications-cm"]
  }

  rule {
    verbs          = ["get"]
    api_groups     = [""]
    resources      = ["secrets"]
    resource_names = ["argocd-notifications-secret"]
  }
}

resource "kubernetes_cluster_role" "release_name_argocd_server" {
  metadata {
    name = "release-name-argocd-server"

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argocd_application_controller" {
  metadata {
    name = "release-name-argocd-application-controller"

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-application-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-application-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argocd-application-controller"
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argocd_notifications_controller" {
  metadata {
    name = "release-name-argocd-notifications-controller"

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-notifications-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argocd-notifications-controller"
  }
}

resource "kubernetes_cluster_role_binding" "release_name_argocd_server" {
  metadata {
    name = "release-name-argocd-server"

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-argocd-server"
  }
}

resource "kubernetes_role" "release_name_argocd_application_controller" {
  metadata {
    name      = "release-name-argocd-application-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-application-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets", "configmaps"]
  }

  rule {
    verbs      = ["create", "get", "list", "watch", "update", "patch", "delete"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "applicationsets", "appprojects"]
  }

  rule {
    verbs      = ["create", "list"]
    api_groups = [""]
    resources  = ["events"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments"]
  }
}

resource "kubernetes_role" "release_name_argocd_applicationset_controller" {
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

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "applicationsets", "applicationsets/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["argoproj.io"]
    resources  = ["applicationsets/status"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["argoproj.io"]
    resources  = ["appprojects"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "watch"]
    api_groups = [""]
    resources  = ["events"]
  }

  rule {
    verbs      = ["create", "update", "delete", "get", "list", "patch", "watch"]
    api_groups = [""]
    resources  = ["configmaps"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps", "extensions"]
    resources  = ["deployments"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }
}

resource "kubernetes_role" "release_name_argocd_notifications_controller" {
  metadata {
    name      = "release-name-argocd-notifications-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  rule {
    verbs      = ["get", "list", "watch", "update", "patch"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "appprojects"]
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "secrets"]
  }

  rule {
    verbs          = ["get"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["argocd-notifications-cm"]
  }

  rule {
    verbs          = ["get"]
    api_groups     = [""]
    resources      = ["secrets"]
    resource_names = ["argocd-notifications-secret"]
  }
}

resource "kubernetes_role" "release_name_argocd_repo_server" {
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

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "applicationsets", "appprojects"]
  }
}

resource "kubernetes_role" "release_name_argocd_server" {
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

  rule {
    verbs      = ["create", "get", "list", "watch", "update", "patch", "delete"]
    api_groups = [""]
    resources  = ["secrets", "configmaps"]
  }

  rule {
    verbs      = ["create", "get", "list", "watch", "update", "delete", "patch"]
    api_groups = ["argoproj.io"]
    resources  = ["applications", "applicationsets", "appprojects"]
  }

  rule {
    verbs      = ["create", "list"]
    api_groups = [""]
    resources  = ["events"]
  }
}

resource "kubernetes_role" "release_name_argocd_dex_server" {
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

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets", "configmaps"]
  }
}

resource "kubernetes_role_binding" "release_name_argocd_application_controller" {
  metadata {
    name      = "release-name-argocd-application-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-application-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-application-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-application-controller"
  }
}

resource "kubernetes_role_binding" "release_name_argocd_applicationset_controller" {
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

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-applicationset-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-applicationset-controller"
  }
}

resource "kubernetes_role_binding" "release_name_argocd_notifications_controller" {
  metadata {
    name      = "release-name-argocd-notifications-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-notifications-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-notifications-controller"
  }
}

resource "kubernetes_role_binding" "release_name_argocd_repo_server" {
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

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-argocd-repo-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-repo-server"
  }
}

resource "kubernetes_role_binding" "release_name_argocd_server" {
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

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-server"
  }
}

resource "kubernetes_role_binding" "release_name_argocd_dex_server" {
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

  subject {
    kind      = "ServiceAccount"
    name      = "argocd-dex-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "release-name-argocd-dex-server"
  }
}

