/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "mimir_query_frontend" {
  metadata {
    name      = "${local.app_name}-query-frontend"
    namespace = var.namespace
    labels    = local.query_frontend_labels
  }

  spec {
    replicas = var.query_frontend_replicas

    selector {
      match_labels = local.query_frontend_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.query_frontend_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.mimir_config.data["mimir.yaml"])
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = "${local.app_name}-config"

            items {
              key  = "mimir.yaml"
              path = "mimir.yaml"
            }
          }
        }

        volume {
          name = "runtime-config"

          config_map {
            name = "${local.app_name}-runtime"
          }
        }

        {{ VolumeEmptyDir "storage" }}

        {{ VolumeEmptyDir "active-queries" }}

        container {
          name  = "query-frontend"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=query-frontend", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml", "-server.grpc.keepalive.max-connection-age=30s", "-shutdown-delay=90s"]

          port {
            name           = "http-metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          port {
            name           = "grpc"
            container_port = 9095
            protocol       = "TCP"
          }

          {{ ContainerResources }}

          {{ VolumeMount "runtime-config" "/var/mimir" }}

          {{ VolumeMount "config" "/etc/mimir" }}

          {{ VolumeMount "storage" "/data" }}

          {{ VolumeMount "active-queries" "/active-query-tracker" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 390
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.query_frontend_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_surge = "15%"
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
