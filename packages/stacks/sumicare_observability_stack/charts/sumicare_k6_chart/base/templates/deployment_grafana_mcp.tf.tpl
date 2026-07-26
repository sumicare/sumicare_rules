/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

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

    {{ DeploymentRollingUpdate 75 }}

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

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        service_account_name            = local.app_name
        automount_service_account_token = true

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
