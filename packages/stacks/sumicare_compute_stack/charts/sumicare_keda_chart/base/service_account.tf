resource "kubernetes_service_account" "keda_operator" {
  metadata {
    name        = "keda-operator"
    namespace   = var.namespace
    labels      = local.operator_labels
    annotations = var.service_account_annotations
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "keda_metrics_server" {
  metadata {
    name        = "keda-metrics-server"
    namespace   = var.namespace
    labels      = local.metrics_server_labels
    annotations = var.service_account_annotations
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "keda_webhook" {
  metadata {
    name        = "keda-webhook"
    namespace   = var.namespace
    labels      = local.webhook_labels
    annotations = var.service_account_annotations
  }

  automount_service_account_token = true
}
