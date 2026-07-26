/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "mimir_distributor" {
  metadata {
    name      = "${local.app_name}-distributor"
    namespace = var.namespace
    labels    = local.distributor_labels
  }

  spec {
    replicas = var.distributor_replicas

    selector {
      match_labels = local.distributor_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.distributor_labels

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
          name  = "distributor"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=distributor", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml", "-server.grpc.keepalive.max-connection-age=60s", "-server.grpc.keepalive.max-connection-age-grace=5m", "-server.grpc.keepalive.max-connection-idle=1m", "-shutdown-delay=90s"]

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

          port {
            name           = "memberlist"
            container_port = 7946
            protocol       = "TCP"
          }

          env {
            name  = "GOMAXPROCS"
            value = "8"
          }

          {{ ContainerResources }}

          {{ VolumeMount "config" "/etc/mimir" }}

          {{ VolumeMount "runtime-config" "/var/mimir" }}

          {{ VolumeMount "storage" "/data" }}

          {{ VolumeMount "active-queries" "/active-query-tracker" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 100
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.distributor_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
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
