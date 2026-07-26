/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "loki_results_cache" {
  metadata {
    name      = "${local.app_name}-results-cache"
    namespace = var.namespace
    labels    = local.results_cache_labels
  }

  spec {
    replicas = var.results_cache_replicas

    selector {
      match_labels = local.results_cache_selector_labels
    }

    template {
      metadata {
        labels = local.results_cache_selector_labels
      }

      spec {
        container {
          name  = "memcached"
          image = "memcached:1.6.39-alpine"
          args  = ["-m 1024", "--extended=modern", "-I 5m", "-c 16384", "-v", "-u 11211"]

          port {
            name           = "client"
            container_port = 11211
          }

          resources {
            limits = {
              memory = "1229Mi"
            }

            requests = {
              cpu    = "500m"
              memory = "1229Mi"
            }
          }

          liveness_probe {
            tcp_socket {
              port = "client"
            }

            initial_delay_seconds = 30
            timeout_seconds       = 5
            period_seconds        = 10
            failure_threshold     = 3
          }

          readiness_probe {
            tcp_socket {
              port = "client"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 3
            period_seconds        = 5
            failure_threshold     = 6
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        container {
          name  = "exporter"
          image = "prom/memcached-exporter:v0.15.3"
          args  = ["--memcached.address=localhost:11211", "--web.listen-address=0.0.0.0:9150"]

          port {
            name           = "http-metrics"
            container_port = 9150
          }

          liveness_probe {
            http_get {
              path = "/metrics"
              port = "http-metrics"
            }

            initial_delay_seconds = 30
            timeout_seconds       = 5
            period_seconds        = 10
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/metrics"
              port = "http-metrics"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 3
            period_seconds        = 5
            failure_threshold     = 3
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 60
        service_account_name             = local.app_name

        security_context {
          run_as_user     = 11211
          run_as_group    = 11211
          run_as_non_root = true
          fs_group        = 11211
        }
      }
    }

    service_name          = "${local.app_name}-results-cache"
    pod_management_policy = "Parallel"

    update_strategy {
      type = "RollingUpdate"
    }
  }
}
