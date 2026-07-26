/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "release_name_argo_workflows_workflow_controller" {
  metadata {
    name      = "${local.app_name}-workflow-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.controller_replicas

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
      }

      spec {
        container {
          name    = "controller"
          image   = "${var.controller_image}:v${var.argo_workflows_version}"
          command = ["workflow-controller"]
          args    = ["--configmap", "${local.app_name}-workflow-controller-configmap", "--executor-image", "${var.executor_image}:v${var.argo_workflows_version}", "--loglevel", "info", "--gloglevel", "0", "--log-format", "text", "--workflow-workers", "32", "--workflow-ttl-workers", "4", "--pod-cleanup-workers", "4", "--cron-workflow-workers", "8"]

          port {
            name           = "metrics"
            container_port = 9090
          }

          port {
            container_port = 6060
          }

          env {
            name = "ARGO_NAMESPACE"

            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }

          env {
            name = "LEADER_ELECTION_IDENTITY"

            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }

          env {
            name  = "LEADER_ELECTION_DISABLE"
            value = "true"
          }

          
liveness_probe {
	http_get {
		path   = "/healthz"
		port   = "6060"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.liveness_probe_initial_delay
	timeout_seconds       = var.liveness_probe_timeout
	period_seconds        = var.liveness_probe_period
	success_threshold     = 1
	failure_threshold     = var.liveness_probe_failure_threshold
}

          image_pull_policy = "IfNotPresent"

          
security_context {
	capabilities {
		drop = ["ALL"]
	}

	read_only_root_filesystem = true
}
        }

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = kubernetes_service_account.argo_workflows_workflow_controller.metadata[0].name

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
