/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

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

            run_as_user               = 1000
            run_as_group              = 1000
            run_as_non_root           = true
            read_only_root_filesystem = true
          }
        }

        service_account_name            = local.app_name
        automount_service_account_token = true

        security_context {
          run_as_user     = 1000
          run_as_group    = 1000
          run_as_non_root = true
          fs_group        = 1000
        }
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_unavailable = "25%"
        max_surge       = "75%"
      }
    }

    revision_history_limit = 10
  }
}

