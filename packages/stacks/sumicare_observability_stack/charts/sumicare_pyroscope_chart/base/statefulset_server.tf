/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_stateful_set" "pyroscope" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.server_labels
    }

    template {
      metadata {
        labels = local.server_labels
        annotations = {
          "checksum/config" = md5(kubernetes_manifest.configmap_monitoring_pyroscope_config.manifest["data"]["config.yaml"])
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = "pyroscope-config"
          }
        }

        volume {
          name = "overrides-config"

          config_map {
            name = "pyroscope-overrides-config"
          }
        }

        volume {
          name = "data"

          empty_dir {}
        }

        container {
          name  = "pyroscope"
          image = "${var.image}:${var.pyroscope_version}"
          args = [
            "-target=all",
            "-self-profiling.disable-push=true",
            "-server.http-listen-port=4040",
            "-memberlist.cluster-label=${var.namespace}-pyroscope",
            "-memberlist.join=dns+${local.app_name}-memberlist.${var.namespace}.svc.cluster.local.:7946",
            "-config.file=/etc/pyroscope/config.yaml",
            "-runtime-config.file=/etc/pyroscope/overrides/overrides.yaml",
            "-log.level=debug",
          ]

          port {
            name           = "http2"
            container_port = 4040
            protocol       = "TCP"
          }

          port {
            name           = "memberlist"
            container_port = 7946
            protocol       = "TCP"
          }

          env {
            name = "POD_NAME"

            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }

          env {
            name  = "NAMESPACE_FQDN"
            value = "${var.namespace}.svc.cluster.local."
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/pyroscope/config.yaml"
            sub_path   = "config.yaml"
          }

          volume_mount {
            name       = "overrides-config"
            mount_path = "/etc/pyroscope/overrides/"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          
readiness_probe {
	http_get {
		path   = "/ready"
		port   = "http2"
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

        dns_policy           = "ClusterFirst"
        service_account_name = kubernetes_service_account.pyroscope.metadata[0].name

        
security_context {
	run_as_non_root = true
	run_as_user     = var.run_as_user
	run_as_group    = var.run_as_group
	fs_group        = var.fs_group
}
      }
    }

    service_name          = "${local.app_name}-headless"
    pod_management_policy = "Parallel"
  }
}
