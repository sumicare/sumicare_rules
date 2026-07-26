/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

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

        volume {
          name = "docker-entrypoint-d-override"

          empty_dir {}
        }

        volume {
          name = "auth"

          secret {
            secret_name = "mimir-basic-auth"
          }
        }

        volume {
          name = "tmp"

          empty_dir {}
        }

        container {
          name  = "gateway"
          image = "${var.gateway_image}:${var.gateway_version}"

          port {
            name           = "http-metrics"
            container_port = 8080
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
            name       = "nginx-config"
            mount_path = "/etc/nginx/nginx.conf"
            sub_path   = "nginx.conf"
          }

          volume_mount {
            name       = "auth"
            mount_path = "/etc/nginx/secrets"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "docker-entrypoint-d-override"
            mount_path = "/docker-entrypoint.d"
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

        termination_grace_period_seconds = 30
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
            match_labels = local.gateway_labels
          }
        }
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

  lifecycle {
    # This is managed by VPA recommender
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].resources.requests,
      spec[0].template[0].spec[0].container[0].resources.limits,
    ]
  }
}
