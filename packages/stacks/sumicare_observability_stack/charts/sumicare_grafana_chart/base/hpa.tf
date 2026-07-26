/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_horizontal_pod_autoscaler" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = local.app_name

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = local.deployment_name
      api_version = "apps/v1"
    }

    min_replicas = 1
    max_replicas = 5

    metric {
      type = "Resource"

      resource {
        name = "cpu"

        target {
          type                = "Utilization"
          average_utilization = 60
        }
      }
    }
  }
}

