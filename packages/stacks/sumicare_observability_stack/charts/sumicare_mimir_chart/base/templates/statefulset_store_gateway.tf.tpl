/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "mimir_store_gateway_zone_a" {
  metadata {
    name      = "${local.app_name}-store-gateway-zone-a"
    namespace = var.namespace

    labels = merge(local.store_gateway_labels, {
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "memberlist"
      "grafana.com/min-time-between-zones-downscale" = "30m"
      "grafana.com/prepare-downscale"                = "true"
      name                                           = "store-gateway-zone-a"
      rollout-group                                  = "store-gateway"
      zone                                           = "zone-a"
    })

    annotations = {
      "grafana.com/prepare-downscale-http-path" = "store-gateway/prepare-shutdown"
      "grafana.com/prepare-downscale-http-port" = "8080"
      rollout-max-unavailable                   = "50"
    }
  }

  spec {
    replicas = var.store_gateway_zone_replicas

    selector {
      match_labels = merge(local.store_gateway_labels, {
        rollout-group = "store-gateway"
        zone          = "zone-a"
      })
    }

    template {
      metadata {
        namespace = var.namespace

        labels = merge(local.store_gateway_labels, {
          "app.kubernetes.io/part-of" = "memberlist"
          name                        = "store-gateway-zone-a"
          rollout-group               = "store-gateway"
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
          name  = "store-gateway"
          image = "${var.image}:${var.mimir_version}"
          args  = ["-target=store-gateway", "-config.expand-env=true", "-config.file=/etc/mimir/mimir.yaml", "-store-gateway.sharding-ring.instance-availability-zone=zone-a", "-server.grpc-max-send-msg-size-bytes=209715200"]

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
            value = "5"
          }

          env {
            name  = "GOMEMLIMIT"
            value = "536870912"
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

        termination_grace_period_seconds = 120
        service_account_name             = local.app_name

        {{ PodSecurityContextWithSeccomp }}

        {{ TopologySpreadConstraint "local.store_gateway_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
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

    service_name          = "${local.app_name}-store-gateway-headless"
    pod_management_policy = "OrderedReady"

    update_strategy {
      type = "OnDelete"
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
