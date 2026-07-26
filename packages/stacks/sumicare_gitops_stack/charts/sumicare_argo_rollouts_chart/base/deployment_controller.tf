/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "release_name_argo_rollouts" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.controller_labels
    }

    strategy {
	type = "RollingUpdate"

	rolling_update {
		max_unavailable = "25%"
		max_surge       = "25%"
	}
}

    template {
      metadata {
        labels = local.controller_labels

        annotations = {
          "checksum/cm" = md5(kubernetes_config_map.argo_rollouts.data["trafficRouterPlugins"])
        }
      }

      spec {
        volume {
          name = "plugin-bin"

          empty_dir {}
        }

        volume {
          name = "tmp"

          empty_dir {}
        }

        container {
          name  = "argo-rollouts"
          image = "${var.image}:v${var.argo_rollouts_version}"
          args  = ["--healthzPort=8080", "--metricsport=8090", "--loglevel=info", "--logformat=text", "--kloglevel=0", "--leader-elect"]

          port {
            name           = "metrics"
            container_port = 8090
          }

          port {
            name           = "healthz"
            container_port = 8080
          }

          volume_mount {
            name       = "plugin-bin"
            mount_path = "/home/argo-rollouts/plugin-bin"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          
liveness_probe {
	http_get {
		path   = "/healthz"
		port   = "8080"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.liveness_probe_initial_delay
	timeout_seconds       = var.liveness_probe_timeout
	period_seconds        = var.liveness_probe_period
	success_threshold     = 1
	failure_threshold     = var.liveness_probe_failure_threshold
}

          
readiness_probe {
	http_get {
		path   = "/metrics"
		port   = "8090"
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

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        termination_grace_period_seconds = 30
        service_account_name             = kubernetes_service_account.argo_rollouts.metadata[0].name

        
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
		match_labels = local.controller_labels
	}

	topology_key = "kubernetes.io/hostname"
	}
}
preferred_during_scheduling_ignored_during_execution {
	weight = 50

	pod_affinity_term {
	label_selector {
		match_labels = local.controller_labels
	}

	topology_key = "topology.kubernetes.io/zone"
	}
}
          }
        }

        
topology_spread_constraint {
          max_skew           = 1
          topology_key       = "topology.kubernetes.io/zone"
          when_unsatisfiable = "ScheduleAnyway"

          label_selector {
            match_labels = local.controller_labels
          }
        }

        
topology_spread_constraint {
          max_skew           = 1
          topology_key       = "kubernetes.io/hostname"
          when_unsatisfiable = "DoNotSchedule"

          label_selector {
            match_labels = local.controller_labels
          }
        }
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
