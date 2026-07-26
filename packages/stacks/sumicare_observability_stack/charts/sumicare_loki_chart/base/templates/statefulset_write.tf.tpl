/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "loki_write" {
  metadata {
    name      = "${local.app_name}-write"
    namespace = var.namespace
    labels    = local.write_labels
  }

  spec {
    replicas = var.write_replicas

    selector {
      match_labels = local.write_labels
    }

    template {
      metadata {
        labels = local.write_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.loki.data["config.yaml"])
        }
      }

      spec {
        {{ VolumeEmptyDir "temp" }}

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
          name  = "write"
          image = "${var.image}:${var.loki_version}"
          args  = ["-config.file=/etc/loki/config/config.yaml", "-target=write"]

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

          {{ VolumeMount "temp" "/tmp" }}

          {{ VolumeMount "config" "/etc/loki/config" }}

          {{ VolumeMount "runtime-config" "/etc/loki/runtime-config" }}

          {{ VolumeMount "data" "/var/loki" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 300
        service_account_name             = local.app_name

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.write_labels" }}
      }
    }

    volume_claim_template {
      metadata {
        name = "data"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = "10Gi"
          }
        }
      }
    }

    service_name           = "${local.app_name}-write-headless"
    pod_management_policy  = "Parallel"
    revision_history_limit = var.revision_history_limit

    persistent_volume_claim_retention_policy {
      when_deleted = "Delete"
      when_scaled  = "Delete"
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
