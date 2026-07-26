/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "mimir_overrides_exporter" {
  metadata {
    name      = "${local.app_name}-overrides-exporter"
    namespace = var.namespace
    labels    = local.overrides_exporter_labels
  }

  spec {
    replicas = var.overrides_exporter_replicas

    selector {
      match_labels = local.overrides_exporter_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.overrides_exporter_labels

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
          name  = "overrides-exporter"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=overrides-exporter", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml"]

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

          {{ VolumeMount "config" "/etc/mimir" }}

          {{ VolumeMount "runtime-config" "/var/mimir" }}

          {{ VolumeMount "storage" "/data" }}

          {{ VolumeMount "active-queries" "/active-query-tracker" }}

          {{ LivenessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}
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
