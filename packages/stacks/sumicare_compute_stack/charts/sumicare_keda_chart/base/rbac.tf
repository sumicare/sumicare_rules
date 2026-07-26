/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "keda_operator" {
  metadata {
    name   = "keda-operator"
    labels = local.operator_labels
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "configmaps/status", "limitranges", "pods", "services", "serviceaccounts"]
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = [""]
    resources  = ["events"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["discovery.k8s.io"]
    resources  = ["endpointslices"]
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["*"]
    resources  = ["*/scale"]
  }

  rule {
    verbs      = ["get"]
    api_groups = ["*"]
    resources  = ["*"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments/scale", "statefulsets/scale"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments", "statefulsets"]
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
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["eventing.keda.sh"]
    resources  = ["cloudeventsources", "cloudeventsources/status", "clustercloudeventsources", "clustercloudeventsources/status"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["keda.sh"]
    resources  = ["scaledjobs", "scaledjobs/finalizers", "scaledjobs/status", "scaledobjects", "scaledobjects/finalizers", "scaledobjects/status", "triggerauthentications", "triggerauthentications/status"]
  }
}

resource "kubernetes_cluster_role" "keda_operator_minimal_cluster_role" {
  metadata {
    name   = "keda-operator-minimal-cluster-role"
    labels = local.operator_labels
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["keda.sh"]
    resources  = ["clustertriggerauthentications", "clustertriggerauthentications/status"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["admissionregistration.k8s.io"]
    resources  = ["validatingwebhookconfigurations"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["apiregistration.k8s.io"]
    resources  = ["apiservices"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["eventing.keda.sh"]
    resources  = ["cloudeventsources", "cloudeventsources/status", "clustercloudeventsources", "clustercloudeventsources/status"]
  }
}

resource "kubernetes_cluster_role" "keda_operator_external_metrics_reader" {
  metadata {
    name   = "keda-operator-external-metrics-reader"
    labels = local.operator_labels
  }

  rule {
    verbs      = ["get"]
    api_groups = ["external.metrics.k8s.io"]
    resources  = ["externalmetrics"]
  }
}

resource "kubernetes_cluster_role" "keda_operator_webhook" {
  metadata {
    name   = "keda-operator-webhook"
    labels = local.webhook_labels
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = ["autoscaling"]
    resources  = ["horizontalpodautoscalers"]
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = ["keda.sh"]
    resources  = ["scaledobjects"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments", "statefulsets"]
  }

  rule {
    verbs      = ["list"]
    api_groups = [""]
    resources  = ["limitranges"]
  }
}

resource "kubernetes_cluster_role_binding" "keda_operator" {
  metadata {
    name   = "keda-operator"
    labels = local.operator_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-operator"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "keda-operator"
  }
}

resource "kubernetes_cluster_role_binding" "keda_operator_minimal" {
  metadata {
    name   = "keda-operator-minimal"
    labels = local.operator_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-operator"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "keda-operator-minimal-cluster-role"
  }
}

resource "kubernetes_cluster_role_binding" "keda_operator_system_auth_delegator" {
  metadata {
    name   = "keda-operator-system-auth-delegator"
    labels = local.metrics_server_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-metrics-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "system:auth-delegator"
  }
}

resource "kubernetes_cluster_role_binding" "keda_operator_hpa_controller_external_metrics" {
  metadata {
    name   = "keda-operator-hpa-controller-external-metrics"
    labels = local.metrics_server_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "horizontal-pod-autoscaler"
    namespace = "kube-system"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "keda-operator-external-metrics-reader"
  }
}

resource "kubernetes_cluster_role_binding" "keda_operator_webhook" {
  metadata {
    name   = "keda-operator-webhook"
    labels = local.webhook_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-webhook"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "keda-operator-webhook"
  }
}

resource "kubernetes_role" "keda_operator_certs" {
  metadata {
    name      = "keda-operator-certs"
    namespace = var.namespace
    labels    = local.operator_labels
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs          = ["get"]
    api_groups     = [""]
    resources      = ["secrets"]
    resource_names = ["kedaorg-certs"]
  }

  rule {
    verbs      = ["create", "update"]
    api_groups = [""]
    resources  = ["secrets"]
  }
}

resource "kubernetes_role_binding" "keda_operator_certs" {
  metadata {
    name      = "keda-operator-certs"
    namespace = var.namespace
    labels    = local.operator_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-operator"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "keda-operator-certs"
  }
}

resource "kubernetes_role_binding" "keda_operator_auth_reader" {
  metadata {
    name      = "keda-operator-auth-reader"
    namespace = "kube-system"
    labels    = local.metrics_server_labels
  }

  subject {
    kind      = "ServiceAccount"
    name      = "keda-metrics-server"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "extension-apiserver-authentication-reader"
  }
}

