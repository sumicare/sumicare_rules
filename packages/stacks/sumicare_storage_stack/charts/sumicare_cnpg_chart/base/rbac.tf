/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "plugin_barman_cloud" {
  metadata {
    name = "plugin-barman-cloud"
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["barmancloud.cnpg.io"]
    resources  = ["objectstores"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["barmancloud.cnpg.io"]
    resources  = ["objectstores/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["barmancloud.cnpg.io"]
    resources  = ["objectstores/status"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["postgresql.cnpg.io"]
    resources  = ["backups"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["postgresql.cnpg.io"]
    resources  = ["clusters/finalizers"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "update", "watch"]
    api_groups = ["rbac.authorization.k8s.io"]
    resources  = ["rolebindings", "roles"]
  }
}

resource "kubernetes_cluster_role_binding" "plugin_barman_cloud_binding" {
  metadata {
    name = "plugin-barman-cloud-binding"

    labels = {
      "app.kubernetes.io/instance"   = "plugin-barman-cloud"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "plugin-barman-cloud"
      "app.kubernetes.io/version"    = "v0.11.0"
      "helm.sh/chart"                = "plugin-barman-cloud-0.5.0"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "plugin-barman-cloud"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "plugin-barman-cloud"
  }
}

resource "kubernetes_role" "plugin_barman_cloud_leader_election_role" {
  metadata {
    name      = "plugin-barman-cloud-leader-election-role"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "plugin-barman-cloud"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "plugin-barman-cloud"
      "app.kubernetes.io/version"    = "v0.11.0"
      "helm.sh/chart"                = "plugin-barman-cloud-0.5.0"
    }
  }

  rule {
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
    api_groups = [""]
    resources  = ["configmaps"]
  }

  rule {
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = [""]
    resources  = ["events"]
  }
}

resource "kubernetes_role_binding" "plugin_barman_cloud_leader_election_rolebinding" {
  metadata {
    name      = "plugin-barman-cloud-leader-election-rolebinding"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "plugin-barman-cloud"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "plugin-barman-cloud"
      "app.kubernetes.io/version"    = "v0.11.0"
      "helm.sh/chart"                = "plugin-barman-cloud-0.5.0"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "plugin-barman-cloud"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "plugin-barman-cloud-leader-election-role"
  }
}

