/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "loki_bloom_builder" {
  metadata {
    name      = "${local.app_name}-bloom-builder"
    namespace = var.namespace
    labels    = local.bloom_builder_labels
  }

  spec {
    replicas = var.bloom_builder_replicas

    selector {
      match_labels = local.bloom_builder_labels
    }

    template {
      metadata {
        labels = local.bloom_builder_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.loki.data["config.yaml"])
        }
      }

      spec {
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

        volume {
          name = "temp"

          empty_dir {}
        }

        volume {
          name = "data"

          empty_dir {}
        }

        container {
          name  = "bloom-builder"
          image = "${var.image}:${var.loki_version}"
          args  = ["-config.file=/etc/loki/config/config.yaml", "-target=bloom-builder"]

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

          volume_mount {
            name       = "config"
            mount_path = "/etc/loki/config"
          }

          volume_mount {
            name       = "runtime-config"
            mount_path = "/etc/loki/runtime-config"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/var/loki"
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
}

        affinity {
          node_affinity {
            required_during_scheduling_ignored_during_execution {
              node_selector_term {
                # Exclude Managed/Serverless Compute
                match_expressions {
                  key      = "eks.amazonaws.com/compute-type"
                  operator = "NotIn"
                  values   = ["fargate", "auto"]
                }
                match_expressions {
                  key      = "cloud.google.com/compute-class"
                  operator = "DoesNotExist"
                }
                match_expressions {
                  key      = "kubernetes.azure.com/cluster-autoscaler-mode"
                  operator = "NotIn"
                  values   = ["automatic"]
                }

                # Exclude Spot/Preemptible Instances
                match_expressions {
                  key      = "cloud.google.com/gke-spot"
                  operator = "NotIn"
                  values   = ["true"]
                }
                match_expressions {
                  key      = "kubernetes.azure.com/scalesetpriority"
                  operator = "NotIn"
                  values   = ["spot"]
                }
                match_expressions {
                  key      = "lifecycle"
                  operator = "NotIn"
                  values   = ["Spot", "spot"]
                }
              }
            }
          }

          pod_anti_affinity {
preferred_during_scheduling_ignored_during_execution {
	weight = 100

	pod_affinity_term {
	label_selector {
		match_labels = local.bloom_builder_labels
	}

	topology_key = "kubernetes.io/hostname"
	}
}
preferred_during_scheduling_ignored_during_execution {
	weight = 50

	pod_affinity_term {
	label_selector {
		match_labels = local.bloom_builder_labels
	}

	topology_key = "topology.kubernetes.io/zone"
	}
}
          }
        }
      }
    }

    strategy {
      rolling_update {
        max_unavailable = "1"
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
