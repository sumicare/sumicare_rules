/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "grafana_mcp" {
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
		max_unavailable = "75%"
		max_surge       = "75%"
	}
}

    template {
      metadata {
        labels = local.selector_labels
      }

      spec {
        container {
          name  = "mcp-grafana"
          image = "${var.image}:${var.grafana_mcp_version}"

          port {
            name           = "mcp-http"
            container_port = 8000
            protocol       = "TCP"
          }

          env {
            name  = "GRAFANA_URL"
            value = "http://grafana:3000"
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

        service_account_name            = local.app_name
        automount_service_account_token = true

        
security_context {
	run_as_non_root = true
	run_as_user     = var.run_as_user
	run_as_group    = var.run_as_group
	fs_group        = var.fs_group
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
