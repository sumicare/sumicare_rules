/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_deployment" "prometheus_prometheus_pushgateway" {
  metadata {
    name      = "prometheus-prometheus-pushgateway"
    namespace = var.namespace

    labels = local.pushgateway_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.pushgateway_labels
    }

    strategy {
      type = "Recreate"
    }

    template {
      metadata {
        labels = local.pushgateway_labels
      }

      spec {
        service_account_name            = "prometheus-prometheus-pushgateway"
        automount_service_account_token = true

        volume {
          name      = "storage-volume"
          empty_dir = {}
        }

        container {
          name  = "pushgateway"
          image = "prom/pushgateway:v1.6.0"

          port {
            name           = "metrics"
            container_port = 9091
            protocol       = "TCP"
          }

          resources {
            limits = {
              cpu    = "200m"
              memory = "100Mi"
            }

            requests = {
              cpu    = "100m"
              memory = "50Mi"
            }
          }

          volume_mount {
            name       = "storage-volume"
            mount_path = "/data"
          }

          liveness_probe {
            http_get {
              path   = "/-/healthy"
              port   = "9091"
              scheme = "HTTP"
            }

            initial_delay_seconds = 10
            timeout_seconds       = 10
          }

          readiness_probe {
            http_get {
              path   = "/-/ready"
              port   = "9091"
              scheme = "HTTP"
            }

            initial_delay_seconds = 10
            timeout_seconds       = 10
          }

          image_pull_policy = "IfNotPresent"
        }

        security_context {
          run_as_user     = 65534
          run_as_non_root = true
          fs_group        = 65534
        }
      }
    }

    revision_history_limit = 10
  }
}
