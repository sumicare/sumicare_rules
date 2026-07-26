/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "grafana_clusterrole" {
  metadata {
    name = "release-name-grafana-clusterrole"

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }
}

resource "kubernetes_cluster_role_binding" "grafana_clusterrolebinding" {
  metadata {
    name = "release-name-grafana-clusterrolebinding"

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = local.deployment_name
    namespace = local.app_name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "release-name-grafana-clusterrole"
  }
}

resource "kubernetes_role" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }
}

resource "kubernetes_role_binding" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = local.deployment_name
    namespace = local.app_name
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = local.deployment_name
  }
}

