/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "dex" {
  metadata {
    name   = local.app_name
    labels = local.labels
  }

  rule {
    verbs      = ["list", "create"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }
}

resource "kubernetes_cluster_role_binding" "dex_cluster" {
  metadata {
    name   = "${local.app_name}-cluster"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = local.app_name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = local.app_name
  }
}

resource "kubernetes_role" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  rule {
    verbs      = ["*"]
    api_groups = ["dex.coreos.com"]
    resources  = ["*"]
  }
}

resource "kubernetes_role_binding" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = local.app_name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = local.app_name
  }
}
