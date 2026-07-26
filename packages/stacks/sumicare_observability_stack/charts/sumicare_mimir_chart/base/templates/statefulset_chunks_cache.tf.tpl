/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "mimir_chunks_cache" {
  metadata {
    name      = "${local.app_name}-chunks-cache"
    namespace = var.namespace
    labels    = local.chunks_cache_labels
  }

  spec {
    replicas = var.chunks_cache_replicas

    selector {
      match_labels = local.chunks_cache_selector_labels
    }

    template {
      metadata {
        labels = local.chunks_cache_selector_labels
      }

      spec {
        container {
          name  = "memcached"
          image = "memcached:1.6.39-alpine"
          args  = ["-m 8192", "--extended=modern", "-I 1m", "-c 16384", "-v", "-u 11211"]

          port {
            name           = "client"
            container_port = 11211
          }

          resources {
            limits = {
              memory = "9830Mi"
            }

            requests = {
              cpu    = "500m"
              memory = "9830Mi"
            }
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

          resources {
            limits = {
              memory = "250Mi"
            }

            requests = {
              cpu    = "50m"
              memory = "50Mi"
            }
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}
      }
    }

    service_name          = "${local.app_name}-chunks-cache"
    pod_management_policy = "Parallel"

    update_strategy {
      type = "RollingUpdate"
    }
  }
}
