/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "mimir_ingester_zone_a" {
  metadata {
    name      = "${local.app_name}-ingester-zone-a"
    namespace = var.namespace

    labels = merge(local.ingester_labels, {
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "memberlist"
      "grafana.com/min-time-between-zones-downscale" = "12h"
      "grafana.com/prepare-downscale"                = "true"
      name                                           = "ingester-zone-a"
      rollout-group                                  = "ingester"
      zone                                           = "zone-a"
    })

    annotations = {
      "grafana.com/prepare-downscale-http-path" = "ingester/prepare-shutdown"
      "grafana.com/prepare-downscale-http-port" = "8080"
      rollout-max-unavailable                   = "50"
    }
  }

  spec {
    replicas = var.ingester_zone_replicas

    selector {
      match_labels = merge(local.ingester_labels, {
        rollout-group = "ingester"
        zone          = "zone-a"
      })
    }

    template {
      metadata {
        namespace = var.namespace

        labels = merge(local.ingester_labels, {
          "app.kubernetes.io/part-of" = "memberlist"
          name                        = "ingester-zone-a"
          rollout-group               = "ingester"
          zone                        = "zone-a"
        })

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

        {{ VolumeEmptyDir "active-queries" }}

        container {
          name  = "ingester"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=ingester", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml", "-ingester.ring.instance-availability-zone=zone-a", "-memberlist.abort-if-fast-join-fails=true"]

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
            value = "4"
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

        termination_grace_period_seconds = 1200
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.ingester_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
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
            storage = "2Gi"
          }
        }
      }
    }

    service_name          = "${local.app_name}-ingester-headless"
    pod_management_policy = "Parallel"

    update_strategy {
      type = "OnDelete"
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
