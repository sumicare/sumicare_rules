/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_cluster_role" "ome_model_agent" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-model-agent"
    labels = local.labels
  }

  rule {
    verbs      = ["watch", "list", "get", "patch", "update"]
    api_groups = [""]
    resources  = ["nodes"]
  }

  rule {
    verbs      = ["get", "list", "watch", "patch", "update", "create", "delete"]
    api_groups = [""]
    resources  = ["configmaps"]
  }

  rule {
    verbs      = ["get"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["get", "list", "watch", "patch", "update"]
    api_groups = ["ome.io"]
    resources  = ["basemodels"]
  }

  rule {
    verbs      = ["get", "list", "watch", "patch", "update"]
    api_groups = ["ome.io"]
    resources  = ["clusterbasemodels"]
  }
}

resource "kubernetes_cluster_role" "ome_proxy_role" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-proxy-role"
    labels = local.labels
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authentication.k8s.io"]
    resources  = ["tokenreviews"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authorization.k8s.io"]
    resources  = ["subjectaccessreviews"]
  }
}

resource "kubernetes_cluster_role" "ome_metrics_auth_role" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-metrics-auth-role"
    labels = local.labels
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authentication.k8s.io"]
    resources  = ["tokenreviews"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authorization.k8s.io"]
    resources  = ["subjectaccessreviews"]
  }
}

resource "kubernetes_cluster_role" "ome_metrics_reader" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-metrics-reader"
    labels = local.labels
  }

  rule {
    verbs             = ["get"]
    non_resource_urls = ["/metrics"]
  }
}

resource "kubernetes_cluster_role" "ome_manager_role" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-manager-role"
    labels = local.labels
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "events", "persistentvolumeclaims", "persistentvolumes", "pods", "serviceaccounts", "services"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["namespaces", "nodes"]
  }

  rule {
    verbs      = ["create", "delete", "get", "patch", "update"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["admissionregistration.k8s.io"]
    resources  = ["mutatingwebhookconfigurations", "validatingwebhookconfigurations"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["autoscaling"]
    resources  = ["horizontalpodautoscalers"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["batch"]
    resources  = ["jobs"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["batch"]
    resources  = ["jobs/finalizers", "jobs/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["keda.sh"]
    resources  = ["scaledobjects"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["keda.sh"]
    resources  = ["scaledobjects/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["leaderworkerset.x-k8s.io"]
    resources  = ["leaderworkersets", "leaderworkersets/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["leaderworkerset.x-k8s.io"]
    resources  = ["leaderworkersets/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["networking.istio.io"]
    resources  = ["sidecars", "virtualservices", "virtualservices/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["networking.istio.io"]
    resources  = ["virtualservices/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["networking.k8s.io"]
    resources  = ["ingresses"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["ome.io"]
    resources  = ["acceleratorclasses", "basemodels", "basemodels/finalizers", "benchmarkjobs", "clusterbasemodels", "clusterservingruntimes", "clusterservingruntimes/finalizers", "finetunedweights", "finetunedweights/finalizers", "inferenceservices", "inferenceservices/finalizers", "servingruntimes", "servingruntimes/finalizers"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["ome.io"]
    resources  = ["acceleratorclasses/finalizers", "clusterbasemodels/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["ome.io"]
    resources  = ["acceleratorclasses/status", "basemodels/status", "benchmarkjobs/finalizers", "benchmarkjobs/status", "clusterbasemodels/status", "clusterservingruntimes/status", "finetunedweights/status", "inferenceservices/status", "servingruntimes/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["ray.io"]
    resources  = ["rayclusters", "rayclusters/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["ray.io"]
    resources  = ["rayclusters/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["rbac.authorization.k8s.io"]
    resources  = ["rolebindings", "roles"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["serving.knative.dev"]
    resources  = ["services", "services/finalizers"]
  }

  rule {
    verbs      = ["get", "patch", "update"]
    api_groups = ["serving.knative.dev"]
    resources  = ["services/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["policy"]
    resources  = ["poddisruptionbudgets"]
  }
}

resource "kubernetes_cluster_role_binding" "ome_model_agent" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-model-agent"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.ome_model_agent.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.ome_model_agent.metadata[0].name
  }
}

resource "kubernetes_cluster_role_binding" "ome_proxy_rolebinding" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-proxy-rolebinding"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.ome_controller_manager.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.ome_proxy_role.metadata[0].name
  }
}

resource "kubernetes_cluster_role_binding" "ome_metrics_auth_rolebinding" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-metrics-auth-rolebinding"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.ome_controller_manager.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.ome_metrics_auth_role.metadata[0].name
  }
}

resource "kubernetes_cluster_role_binding" "ome_manager_rolebinding" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-manager-rolebinding"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.ome_controller_manager.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.ome_manager_role.metadata[0].name
  }
}

resource "kubernetes_role" "ome_leader_election_role" {
  metadata {
    name      = "${var.org}-${var.env}-${local.app_name}-leader-election-role"
    namespace = var.namespace
    labels    = local.labels
  }

  rule {
    verbs      = ["create", "get", "list", "update"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs      = ["get", "list", "watch", "create", "update", "patch", "delete"]
    api_groups = [""]
    resources  = ["configmaps"]
  }

  rule {
    verbs      = ["get", "update", "patch"]
    api_groups = [""]
    resources  = ["configmaps/status"]
  }

  rule {
    verbs      = ["create"]
    api_groups = [""]
    resources  = ["events"]
  }
}

resource "kubernetes_role_binding" "ome_leader_election_rolebinding" {
  metadata {
    name      = "${var.org}-${var.env}-${local.app_name}-leader-election-rolebinding"
    namespace = var.namespace
    labels    = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.ome_controller_manager.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = kubernetes_role.ome_leader_election_role.metadata[0].name
  }
}
