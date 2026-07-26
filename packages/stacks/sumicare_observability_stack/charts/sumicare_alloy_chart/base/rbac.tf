/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "release_name_alloy" {
  metadata {
    name = "release-name-alloy"

    labels = {
      "app.kubernetes.io/component"  = "rbac"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["", "discovery.k8s.io", "networking.k8s.io"]
    resources  = ["endpoints", "endpointslices", "ingresses", "pods", "services"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["pods", "pods/log", "namespaces"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["monitoring.grafana.com"]
    resources  = ["podlogs"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["monitoring.coreos.com"]
    resources  = ["prometheusrules"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["monitoring.coreos.com"]
    resources  = ["podmonitors", "servicemonitors", "probes", "scrapeconfigs"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["events"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "secrets"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps", "extensions"]
    resources  = ["replicasets"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["nodes", "nodes/proxy", "nodes/metrics"]
  }

  rule {
    verbs             = ["get"]
    non_resource_urls = ["/metrics"]
  }
}

resource "kubernetes_cluster_role_binding" "release_name_alloy" {
  metadata {
    name = "release-name-alloy"

    labels = {
      "app.kubernetes.io/component"  = "rbac"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "release-name-alloy"
    namespace = "alloy"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-alloy"
  }
}

