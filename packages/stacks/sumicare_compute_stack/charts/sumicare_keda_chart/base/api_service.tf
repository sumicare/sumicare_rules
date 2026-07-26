/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_manifest" "apiservice_v1beta1_external_metrics_k8s_io" {
  manifest = {
    apiVersion = "apiregistration.k8s.io/v1"
    kind       = "APIService"
    metadata = {
      labels = local.apiservice_labels
      name   = "v1beta1.external.metrics.k8s.io"
    }
    spec = {
      group                = "external.metrics.k8s.io"
      groupPriorityMinimum = 100
      service = {
        name      = "keda-operator-metrics-apiserver"
        namespace = var.namespace
        port      = 443
      }
      version         = "v1beta1"
      versionPriority = 100
    }
  }
}
