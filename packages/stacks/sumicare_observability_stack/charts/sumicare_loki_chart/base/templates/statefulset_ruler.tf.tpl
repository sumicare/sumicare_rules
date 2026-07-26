/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "loki_ruler" {
  metadata {
    name      = "${local.app_name}-ruler"
    namespace = var.namespace
    labels    = local.ruler_labels
  }

  spec {
    replicas = var.ruler_replicas

    selector {
      match_labels = local.ruler_labels
    }

    template {
      metadata {
        labels = local.ruler_labels

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

        {{ VolumeEmptyDir "sc-rules-volume" }}

        container {
          name  = "ruler"
          image = "${var.image}:${var.loki_version}"
          args  = ["-config.file=/etc/loki/config/config.yaml", "-target=ruler"]

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

          {{ VolumeMount "sc-rules-volume" "/rules" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        container {
          name  = "loki-sc-rules"
          image = "${var.sidecar_image}:${var.sidecar_version}"

          env {
            name  = "METHOD"
            value = "WATCH"
          }

          env {
            name  = "LABEL"
            value = "loki_rule"
          }

          env {
            name  = "FOLDER"
            value = "/rules"
          }

          env {
            name  = "RESOURCE"
            value = "both"
          }

          env {
            name  = "WATCH_SERVER_TIMEOUT"
            value = "60"
          }

          env {
            name  = "WATCH_CLIENT_TIMEOUT"
            value = "60"
          }

          env {
            name  = "LOG_LEVEL"
            value = "INFO"
          }

          {{ VolumeMount "sc-rules-volume" "/rules" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 300
        service_account_name             = local.app_name
        automount_service_account_token  = true

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.ruler_labels" }}
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

    service_name           = "${local.app_name}-ruler-headless"
    pod_management_policy  = "Parallel"
    revision_history_limit = var.revision_history_limit

    persistent_volume_claim_retention_policy {
      when_deleted = "Delete"
      when_scaled  = "Delete"
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
