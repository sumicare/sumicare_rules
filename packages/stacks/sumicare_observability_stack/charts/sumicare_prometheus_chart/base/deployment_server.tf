/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_deployment" "prometheus_server" {
  metadata {
    name      = "prometheus-server"
    namespace = var.namespace

    labels = local.server_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.server_labels
    }

    strategy {
      type = "Recreate"
    }

    template {
      metadata {
        labels = local.server_labels
      }

      spec {
        service_account_name = "prometheus-server"

        volume {
          name = "config-volume"

          config_map {
            name = "prometheus-server"
          }
        }

        volume {
          name = "storage-volume"

          persistent_volume_claim {
            claim_name = "prometheus-server"
          }
        }

        container {
          name  = "prometheus-server-configmap-reload"
          image = "quay.io/prometheus-operator/prometheus-config-reloader:v0.89.0"
          args  = ["--watched-dir=/etc/config", "--listen-address=0.0.0.0:8080", "--reload-url=http://127.0.0.1:9090/-/reload"]

          port {
            name           = "metrics"
            container_port = 8080
          }

          volume_mount {
            name       = "config-volume"
            read_only  = true
            mount_path = "/etc/config"
          }

          liveness_probe {
            http_get {
              path   = "/healthz"
              port   = "metrics"
              scheme = "HTTP"
            }

            initial_delay_seconds = 2
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path   = "/healthz"
              port   = "metrics"
              scheme = "HTTP"
            }

            period_seconds = 10
          }

          image_pull_policy = "IfNotPresent"
        }

        container {
          name  = "prometheus-server"
          image = "prom/prometheus:v2.45.0"
          args  = ["--storage.tsdb.retention.time=15d", "--config.file=/etc/config/prometheus.yml", "--storage.tsdb.path=/data", "--web.console.libraries=/etc/prometheus/console_libraries", "--web.console.templates=/etc/prometheus/consoles", "--web.enable-lifecycle"]

          port {
            container_port = 9090
          }

          resources {
            limits = {
              cpu    = "2"
              memory = "4Gi"
            }

            requests = {
              cpu    = "1"
              memory = "2Gi"
            }
          }

          volume_mount {
            name       = "config-volume"
            mount_path = "/etc/config"
          }

          volume_mount {
            name       = "storage-volume"
            mount_path = "/data"
          }

          liveness_probe {
            http_get {
              path   = "/-/healthy"
              port   = "9090"
              scheme = "HTTP"
            }

            initial_delay_seconds = 30
            timeout_seconds       = 10
            period_seconds        = 15
            success_threshold     = 1
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path   = "/-/ready"
              port   = "9090"
              scheme = "HTTP"
            }

            initial_delay_seconds = 30
            timeout_seconds       = 4
            period_seconds        = 5
            success_threshold     = 1
            failure_threshold     = 3
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            read_only_root_filesystem = true
          }
        }

        termination_grace_period_seconds = 300
        dns_policy                       = "ClusterFirst"
        enable_service_links             = true

        security_context {
          run_as_user     = 65534
          run_as_group    = 65534
          run_as_non_root = true
          fs_group        = 65534
        }
      }
    }

    revision_history_limit = 10
  }
}
