/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "rollout_operator" {
  metadata {
    name      = "${local.deployment_name}-rollout-operator"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.rollout_operator_replicas

    selector {
      match_labels = {
        "app.kubernetes.io/instance" = "${var.org}-${var.env}"
        "app.kubernetes.io/name"     = "rollout-operator"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/instance" = "${var.org}-${var.env}"
          "app.kubernetes.io/name"     = "rollout-operator"
        }
      }

      spec {
        container {
          name  = "rollout-operator"
          image = "${var.rollout_operator_image}:${var.rollout_operator_version}"
          args  = ["-kubernetes.namespace=${var.namespace}", "-server-tls.enabled=true", "-server-tls.self-signed-cert.secret-name=certificate"]

          port {
            name           = "http-metrics"
            container_port = 8001
            protocol       = "TCP"
          }

          port {
            name           = "https"
            container_port = 8443
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

          
readiness_probe {
	http_get {
		path   = "/ready"
		port   = "8001"
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

        service_account_name = "${local.app_name}-rollout-operator"

        
security_context {
	run_as_non_root = true
	run_as_user     = var.run_as_user
	run_as_group    = var.run_as_group
	fs_group        = var.fs_group
}
      }
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
