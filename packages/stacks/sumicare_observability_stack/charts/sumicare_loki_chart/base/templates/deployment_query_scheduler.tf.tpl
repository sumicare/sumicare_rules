/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "loki_query_scheduler" {
  metadata {
    name      = "${local.app_name}-query-scheduler"
    namespace = var.namespace
    labels    = local.query_scheduler_labels
  }

  spec {
    replicas = var.query_scheduler_replicas

    selector {
      match_labels = local.query_scheduler_labels
    }

    template {
      metadata {
        labels = local.query_scheduler_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.loki.data["config.yaml"])
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = local.app_name

            items {
              key  = "config.yaml"
              path = "config.yaml"
            }
          }
        }

        volume {
          name = "runtime-config"

          config_map {
            name = "${local.app_name}-runtime"
          }
        }

        container {
          name  = "query-scheduler"
          image = "${var.image}:${var.loki_version}"
          args  = ["-config.file=/etc/loki/config/config.yaml", "-target=query-scheduler"]

          port {
            name           = "http-metrics"
            container_port = 3100
            protocol       = "TCP"
          }

          port {
            name           = "grpc"
            container_port = 9095
            protocol       = "TCP"
          }

          port {
            name           = "http-memberlist"
            container_port = 7946
            protocol       = "TCP"
          }

          {{ VolumeMount "config" "/etc/loki/config" }}

          {{ VolumeMount "runtime-config" "/etc/loki/runtime-config" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.query_scheduler_labels" }}
      }
    }

    strategy {
      rolling_update {
        max_unavailable = "1"
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
