/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "mimir_gateway" {
  metadata {
    name      = "${local.app_name}-gateway"
    namespace = var.namespace
    labels    = local.gateway_labels
  }

  spec {
    replicas = var.gateway_replicas

    selector {
      match_labels = local.gateway_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.gateway_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.mimir_gateway_nginx.data["nginx.conf"])
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

        volume {
          name = "nginx-config"

          config_map {
            name = "${local.app_name}-gateway-nginx"
          }
        }

        {{ VolumeEmptyDir "docker-entrypoint-d-override" }}

        {{ VolumeSecret "auth" "mimir-basic-auth" }}

        {{ VolumeEmptyDir "tmp" }}

        container {
          name  = "gateway"
          image = "${var.gateway_image}:${var.gateway_version}"

          port {
            name           = "http-metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          {{ ContainerResources }}

          volume_mount {
            name       = "nginx-config"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
          }

          {{ VolumeMount "auth" "/etc/nginx/secrets" }}

          {{ VolumeMount "tmp" "/tmp" }}

          {{ VolumeMount "docker-entrypoint-d-override" "/docker-entrypoint.d" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.gateway_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
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
