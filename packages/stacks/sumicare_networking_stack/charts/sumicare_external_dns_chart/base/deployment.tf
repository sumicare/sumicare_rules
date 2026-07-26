/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "external_dns" {
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

    template {
      metadata {
        labels = local.controller_labels
      }

      spec {
        container {
          name  = local.app_name
          image = "${var.image}:v${var.external_dns_version}"
          args  = ["--log-level=info", "--log-format=text", "--interval=1m", "--source=service", "--source=ingress", "--policy=upsert-only", "--registry=txt", "--provider=aws"]

          port {
            name           = "http"
            container_port = 7979
            protocol       = "TCP"
          }

          
liveness_probe {
	http_get {
		path   = "/healthz"
		port   = "http"
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
		port   = "http"
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

        service_account_name            = kubernetes_service_account.external_dns.metadata[0].name
        automount_service_account_token = true

        security_context {
          run_as_non_root = true
          run_as_user     = var.run_as_user
          run_as_group    = var.run_as_group
          fs_group        = var.fs_group

          seccomp_profile {
              type = "RuntimeDefault"
            }
        }
      }
    }

    strategy {
      type = "Recreate"
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
