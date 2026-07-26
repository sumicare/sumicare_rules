/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_manifest" "volcano_prometheus_rule" {
  manifest = {
    apiVersion = "monitoring.coreos.com/v1"
    kind       = "PrometheusRule"

    metadata = {
      name      = "volcano-alerts"
      namespace = var.namespace
      labels = {
        app        = "volcano"
        component  = "monitoring"
        prometheus = "volcano"
      }
    }

    spec = {
      groups = [
        {
          name = "volcano"
          rules = [
            {
              alert = "HighPodMemory"
              expr  = "sum(container_memory_usage_bytes{namespace=\"volcano-system\"}) > 1073741824"
              for   = "5m"
              labels = {
                severity = "warning"
              }
              annotations = {
                summary     = "High Memory Usage in Volcano"
                description = "Volcano system pods are using {{ "{{" }} $value | humanize {{ "}}" }} bytes of memory"
              }
            }
          ]
        }
      ]
    }
  }
}
