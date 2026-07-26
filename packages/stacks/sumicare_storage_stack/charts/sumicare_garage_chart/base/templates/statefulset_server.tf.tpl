/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "garage" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.server_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.server_labels
    }

    template {
      metadata {
        labels = local.server_labels
      }

      spec {
        service_account_name = kubernetes_service_account.garage.metadata[0].name

        container {
          name  = "garage"
          image = "${var.image}:v${var.garage_version}"

          {{ ContainerResources }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}
      }
    }

    service_name           = "${local.app_name}-headless"
    revision_history_limit = var.revision_history_limit
  }
}
