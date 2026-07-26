/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "loki_gateway" {
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
        labels = local.gateway_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.loki_gateway.data["nginx.conf"])
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = "${local.app_name}-gateway"
          }
        }

        {{ VolumeSecret "auth" "loki-gateway-auth-secret" }}

        {{ VolumeEmptyDir "tmp" }}

        {{ VolumeEmptyDir "docker-entrypoint-d-override" }}

        container {
          name  = "nginx"
          image = "${var.gateway_image}:${var.gateway_version}"

          port {
            name           = "http-metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          {{ VolumeMount "config" "/etc/nginx" }}

          {{ VolumeMount "auth" "/etc/nginx/secrets" }}

          {{ VolumeMount "tmp" "/tmp" }}

          {{ VolumeMount "docker-entrypoint-d-override" "/docker-entrypoint.d" }}

          {{ ReadinessProbe "/" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        security_context {
          run_as_user     = 101
          run_as_group    = 101
          run_as_non_root = true
          fs_group        = 101
        }

        {{ NodeAffinityWithPodAntiAffinity "local.gateway_labels" }}

        enable_service_links = true
      }
    }

    strategy {
      type = "RollingUpdate"
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
