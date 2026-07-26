/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.selector_labels
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
        labels = local.selector_labels
      }

      spec {
        volume {
          name = "config"

          secret {
            secret_name = "${local.app_name}-config"
          }
        }

        container {
          name  = "dex"
          image = "${var.image}:${var.dex_version}"
          args  = ["dex", "serve", "--web-http-addr", "0.0.0.0:5556", "--grpc-addr", "0.0.0.0:5557", "--telemetry-addr", "0.0.0.0:5558", "/etc/dex/cfg/config.yaml"]

          env {
            name = "KUBERNETES_POD_NAMESPACE"

            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }

          port {
            name           = "http"
            container_port = 5556
            protocol       = "TCP"
          }

          port {
            name           = "grpc"
            container_port = 5557
            protocol       = "TCP"
          }

          port {
            name           = "telemetry"
            container_port = 5558
            protocol       = "TCP"
          }

          volume_mount {
            name       = "config"
            read_only  = true
            mount_path = "/etc/dex/cfg"
          }

          image_pull_policy = "IfNotPresent"
        }

        service_account_name = local.app_name

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
		match_labels = local.selector_labels
	}

	topology_key = "kubernetes.io/hostname"
	}
}
preferred_during_scheduling_ignored_during_execution {
	weight = 50

	pod_affinity_term {
	label_selector {
		match_labels = local.selector_labels
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
            match_labels = local.selector_labels
          }
        }

        
topology_spread_constraint {
          max_skew           = 1
          topology_key       = "kubernetes.io/hostname"
          when_unsatisfiable = "DoNotSchedule"

          label_selector {
            match_labels = local.selector_labels
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
