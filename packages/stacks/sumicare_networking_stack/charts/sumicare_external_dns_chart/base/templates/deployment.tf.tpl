/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

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

          {{ LivenessProbe "/healthz" "http" "HTTP" }}

          {{ ReadinessProbe "/healthz" "http" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name            = kubernetes_service_account.external_dns.metadata[0].name
        automount_service_account_token = true

        {{ PodSecurityContextWithSeccomp }}
      }
    }

    strategy {
      type = "Recreate"
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
