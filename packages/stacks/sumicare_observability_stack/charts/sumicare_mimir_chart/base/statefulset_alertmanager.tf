/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

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

        volume {
          name = "tmp"

          empty_dir {}
        }

        volume {
          name = "active-queries"

          empty_dir {}
        }

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

          
resources {
            limits = {
              cpu    = var.resources.limits.cpu
              memory = var.resources.limits.memory
            }

            requests = {
              cpu    = var.resources.requests.cpu
              memory = var.resources.requests.memory
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/mimir"
          }

          volume_mount {
            name       = "runtime-config"
            mount_path = "/var/mimir"
          }

          volume_mount {
            name       = "storage"
            mount_path = "/data"
          }

          volume_mount {
            name       = "alertmanager-fallback-config"
            mount_path = "/configs/"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "active-queries"
            mount_path = "/active-query-tracker"
          }

          
readiness_probe {
	http_get {
		path   = "/ready"
		port   = "http-metrics"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.readiness_probe_initial_delay
	timeout_seconds       = var.readiness_probe_timeout
	period_seconds        = var.readiness_probe_period
	success_threshold     = 1
	failure_threshold     = var.readiness_probe_failure_threshold
}

          image_pull_policy = "IfNotPresent"

          
security_context {
	capabilities {
		drop = ["ALL"]
	}

	read_only_root_filesystem = true
}
        }

        termination_grace_period_seconds = 900
        service_account_name             = local.app_name

        security_context {
          run_as_non_root = true
          run_as_user     = var.run_as_user
          run_as_group    = var.run_as_group
          fs_group        = var.fs_group

          seccomp_profile {
              type = "RuntimeDefault"
            }
        }

        
topology_spread_constraint {
          max_skew           = 1
          topology_key       = "kubernetes.io/hostname"
          when_unsatisfiable = "ScheduleAnyway"

          label_selector {
            match_labels = local.alertmanager_labels
          }
        }
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

  lifecycle {
    # This is managed by VPA recommender
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].resources.requests,
      spec[0].template[0].spec[0].container[0].resources.limits,
    ]
  }
}
