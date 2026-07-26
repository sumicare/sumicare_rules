/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "local_path_storage_local_path_provisioner" {
  metadata {
    name = "local-path-storage-local-path-provisioner"

    labels = {
      "app.kubernetes.io/instance"   = "local-path-storage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "local-path-provisioner"
      "app.kubernetes.io/version"    = "v0.0.34"
      "helm.sh/chart"                = "local-path-provisioner-0.0.34"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["nodes", "configmaps", "pods", "pods/log"]
  }

  rule {
    verbs      = ["get", "list", "watch", "update"]
    api_groups = [""]
    resources  = ["persistentvolumeclaims"]
  }

  rule {
    verbs      = ["get", "list", "watch", "create", "patch", "update", "delete"]
    api_groups = [""]
    resources  = ["persistentvolumes"]
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = [""]
    resources  = ["events"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["storage.k8s.io"]
    resources  = ["storageclasses"]
  }
}

resource "kubernetes_cluster_role_binding" "local_path_storage_local_path_provisioner" {
  metadata {
    name = "local-path-storage-local-path-provisioner"

    labels = {
      "app.kubernetes.io/instance"   = "local-path-storage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "local-path-provisioner"
      "app.kubernetes.io/version"    = "v0.0.34"
      "helm.sh/chart"                = "local-path-provisioner-0.0.34"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "local-path-storage-local-path-provisioner"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "local-path-storage-local-path-provisioner"
  }
}

resource "kubernetes_role" "local_path_storage_local_path_provisioner" {
  metadata {
    name      = "local-path-storage-local-path-provisioner"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "local-path-storage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "local-path-provisioner"
      "app.kubernetes.io/version"    = "v0.0.34"
      "helm.sh/chart"                = "local-path-provisioner-0.0.34"
    }
  }

  rule {
    verbs      = ["get", "list", "watch", "create", "patch", "update", "delete"]
    api_groups = [""]
    resources  = ["pods"]
  }
}

resource "kubernetes_role_binding" "local_path_storage_local_path_provisioner" {
  metadata {
    name      = "local-path-storage-local-path-provisioner"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "local-path-storage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "local-path-provisioner"
      "app.kubernetes.io/version"    = "v0.0.34"
      "helm.sh/chart"                = "local-path-provisioner-0.0.34"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "local-path-storage-local-path-provisioner"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "local-path-storage-local-path-provisioner"
  }
}

