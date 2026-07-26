/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_cluster_role" "external_dns" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}"
    labels = local.labels
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = [""]
    resources  = ["nodes"]
  }

  rule {
    verbs      = ["get", "watch", "list"]
    api_groups = [""]
    resources  = ["pods"]
  }

  rule {
    verbs      = ["get", "watch", "list"]
    api_groups = [""]
    resources  = ["services"]
  }

  rule {
    verbs      = ["get", "watch", "list"]
    api_groups = ["discovery.k8s.io"]
    resources  = ["endpointslices"]
  }

  rule {
    verbs      = ["get", "watch", "list"]
    api_groups = ["extensions", "networking.k8s.io"]
    resources  = ["ingresses"]
  }
}

resource "kubernetes_cluster_role_binding" "external_dns_viewer" {
  metadata {
    name   = "${var.org}-${var.env}-${local.app_name}-viewer"
    labels = local.labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = kubernetes_service_account.external_dns.metadata[0].name
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = kubernetes_cluster_role.external_dns.metadata[0].name
  }
}
