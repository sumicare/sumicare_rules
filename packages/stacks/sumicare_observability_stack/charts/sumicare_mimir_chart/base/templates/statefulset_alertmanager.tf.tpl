/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "mimir_alertmanager_zone_a" {
  metadata {
    name      = "${local.app_name}-alertmanager-zone-a"
    namespace = var.namespace

    labels = merge(local.alertmanager_labels, {
      "app.kubernetes.io/part-of" = "memberlist"
      name                        = "alertmanager-zone-a"
      rollout-group               = "alertmanager"
      zone                        = "zone-a"
    })

    annotations = {
      rollout-max-unavailable = "2"
    }
  }

  spec {
    replicas = var.alertmanager_zone_replicas

    selector {
      match_labels = merge(local.alertmanager_labels, {
        rollout-group = "alertmanager"
        zone          = "zone-a"
      })
    }

    template {
      metadata {
        namespace = var.namespace

        labels = merge(local.alertmanager_labels, {
          "app.kubernetes.io/part-of" = "memberlist"
          name                        = "alertmanager-zone-a"
          rollout-group               = "alertmanager"
          zone                        = "zone-a"
        })

        annotations = {
          "checksum/alertmanager-fallback-config" = md5(kubernetes_config_map.mimir_alertmanager_fallback_config.data["alertmanager_fallback_config.yaml"])
          "checksum/config"                       = md5(kubernetes_config_map.mimir_config.data["mimir.yaml"])
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

        {{ VolumeEmptyDir "tmp" }}

        {{ VolumeEmptyDir "active-queries" }}

        volume {
          name = "alertmanager-fallback-config"

          config_map {
            name = "${local.app_name}-alertmanager-fallback-config"
          }
        }

        container {
          name  = "alertmanager"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=alertmanager", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml", "-alertmanager.sharding-ring.instance-availability-zone=zone-a", "-server.http-idle-timeout=6m"]

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

          {{ ContainerResources }}

          {{ VolumeMount "config" "/etc/mimir" }}

          {{ VolumeMount "runtime-config" "/var/mimir" }}

          {{ VolumeMount "storage" "/data" }}

          {{ VolumeMount "alertmanager-fallback-config" "/configs/" }}

          {{ VolumeMount "tmp" "/tmp" }}

          {{ VolumeMount "active-queries" "/active-query-tracker" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 900
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.alertmanager_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
      }
    }

    volume_claim_template {
      metadata {
        name = "storage"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = "1Gi"
          }
        }
      }
    }

    service_name = "${local.app_name}-alertmanager"

    update_strategy {
      type = "OnDelete"
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
