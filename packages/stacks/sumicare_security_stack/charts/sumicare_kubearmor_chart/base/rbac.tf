/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "kubearmor_clusterrole" {
  metadata {
    name = "kubearmor-clusterrole"
  }

  rule {
    verbs      = ["get", "list", "watch", "update"]
    api_groups = [""]
    resources  = ["namespaces"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["pods", "nodes", "configmaps"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments", "replicasets", "daemonsets", "statefulsets"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["batch"]
    resources  = ["jobs", "cronjobs"]
  }

  rule {
    verbs      = ["get", "list", "watch", "update", "delete"]
    api_groups = ["security.kubearmor.com"]
    resources  = ["kubearmorpolicies", "kubearmorclusterpolicies", "kubearmorhostpolicies"]
  }

  rule {
    verbs             = ["get"]
    non_resource_urls = ["/apis", "/apis/*"]
  }
}

resource "kubernetes_cluster_role" "kubearmor_relay_clusterrole" {
  metadata {
    name = "kubearmor-relay-clusterrole"
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = [""]
    resources  = ["pods"]
  }
}

resource "kubernetes_cluster_role" "kubearmor_controller_clusterrole" {
  metadata {
    name = "kubearmor-controller-clusterrole"
  }

  rule {
    verbs      = ["create", "delete", "get", "patch", "list", "watch", "update"]
    api_groups = [""]
    resources  = ["pods"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["nodes"]
  }

  rule {
    verbs      = ["get", "update"]
    api_groups = ["apps"]
    resources  = ["deployments", "statefulsets", "daemonsets", "replicasets"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["security.kubearmor.com"]
    resources  = ["kubearmorpolicies", "kubearmorclusterpolicies", "kubearmorhostpolicies"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["security.kubearmor.com"]
    resources  = ["kubearmorpolicies/status", "kubearmorclusterpolicies/status", "kubearmorhostpolicies/status"]
  }
}

resource "kubernetes_cluster_role_binding" "kubearmor_clusterrolebinding" {
  metadata {
    name = "kubearmor-clusterrolebinding"
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kubearmor"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kubearmor-clusterrole"
  }
}

resource "kubernetes_cluster_role_binding" "kubearmor_relay_clusterrolebinding" {
  metadata {
    name = "kubearmor-relay-clusterrolebinding"
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kubearmor-relay"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kubearmor-relay-clusterrole"
  }
}

resource "kubernetes_cluster_role_binding" "kubearmor_controller_clusterrolebinding" {
  metadata {
    name = "kubearmor-controller-clusterrolebinding"
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kubearmor-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kubearmor-controller-clusterrole"
  }
}

resource "kubernetes_role" "kubearmor_controller_leader_election_role" {
  metadata {
    name      = "kubearmor-controller-leader-election-role"
    namespace = var.namespace
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

resource "kubernetes_role_binding" "kubearmor_controller_leader_election_rolebinding" {
  metadata {
    name      = "kubearmor-controller-leader-election-rolebinding"
    namespace = var.namespace
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kubearmor-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "kubearmor-controller-leader-election-role"
  }
}

