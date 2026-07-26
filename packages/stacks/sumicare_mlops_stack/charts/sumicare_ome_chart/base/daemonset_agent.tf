/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_daemonset" "ome_model_agent_daemonset" {
  metadata {
    name      = "${local.app_name}-model-agent-daemonset"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = {
        "app.kubernetes.io/component" = "${local.app_name}-model-agent-daemonset"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/component" = "${local.app_name}-model-agent-daemonset"
          logging-forward               = "enabled"
        }

        annotations = {
          "prometheus.io/path"   = "/metrics"
          "prometheus.io/port"   = "8080"
          "prometheus.io/scrape" = "true"
        }
      }

      spec {
        volume {
          name = "host-models"

          host_path {
            path = "/mnt/data/models"
            type = "DirectoryOrCreate"
          }
        }

        container {
          name  = "model-agent"
          image = "${var.image}:v${var.ome_version}"
          args  = ["--models-root-dir", "/mnt/data/models", "--num-download-worker", "2"]

          port {
            name           = "metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          env {
            name = "NODE_NAME"

            value_from {
              field_ref {
                field_path = "spec.nodeName"
              }
            }
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
            name       = "host-models"
            mount_path = "/mnt/data/models"
          }

          
liveness_probe {
	http_get {
		path   = "/livez"
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
		path   = "/healthz"
		port   = "8080"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.readiness_probe_initial_delay
	timeout_seconds       = var.readiness_probe_timeout
	period_seconds        = var.readiness_probe_period
	success_threshold     = 1
	failure_threshold     = var.readiness_probe_failure_threshold
}

          image_pull_policy = "Always"
        }

        service_account_name = kubernetes_service_account.ome_model_agent.metadata[0].name

        dynamic "toleration" {
          for_each = var.tolerations
          content {
            key                = lookup(toleration.value, "key", null)
            operator           = lookup(toleration.value, "operator", null)
            value              = lookup(toleration.value, "value", null)
            effect             = lookup(toleration.value, "effect", null)
            toleration_seconds = lookup(toleration.value, "toleration_seconds", null)
          }
        }

        priority_class_name = "system-node-critical"
      }
    }

    strategy {
      type = "RollingUpdate"
    }
  }
}
