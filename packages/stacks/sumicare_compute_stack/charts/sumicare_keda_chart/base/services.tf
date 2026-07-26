resource "kubernetes_service" "keda_operator" {
  metadata {
    name      = "keda-operator"
    namespace = var.namespace
    labels    = local.operator_labels
  }

  spec {
    port {
      name        = "metricsservice"
      port        = 9666
      target_port = "9666"
    }

    selector = local.operator_labels
  }
}

resource "kubernetes_service" "keda_operator_metrics_apiserver" {
  metadata {
    name      = "keda-operator-metrics-apiserver"
    namespace = var.namespace
    labels    = local.metrics_server_labels
  }

  spec {
    port {
      name         = "https"
      protocol     = "TCP"
      app_protocol = "https"
      port         = 443
      target_port  = "6443"
    }

    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8080
      target_port = "8080"
    }

    selector = local.metrics_server_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "keda_admission_webhook" {
  metadata {
    name      = "keda-admission-webhooks"
    namespace = var.namespace
    labels    = local.webhook_labels
  }

  spec {
    port {
      name         = "https"
      protocol     = "TCP"
      app_protocol = "https"
      port         = 443
      target_port  = "9443"
    }

    selector = local.webhook_labels
  }
}
