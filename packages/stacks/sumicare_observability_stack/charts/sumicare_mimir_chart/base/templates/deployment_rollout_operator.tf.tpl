/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "mimir_rollout_operator" {
  metadata {
    name      = "rollout-operator"
    namespace = var.namespace
    labels    = local.rollout_operator_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.rollout_operator_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.rollout_operator_labels
      }

      spec {
        container {
          name  = "rollout-operator"
          image = "${var.rollout_operator_image}:v${var.rollout_operator_version}"
          args  = ["-kubernetes.namespace=mimir", "-server-tls.enabled=true", "-server-tls.self-signed-cert.secret-name=certificate", "-server-tls.self-signed-cert.dns-name=release-name-rollout-operator.mimir.svc"]

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

          {{ ContainerResources }}

          {{ Probe "readiness" "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = "rollout-operator"

        {{ PodSecurityContextWithSeccomp }}
      }
    }

    strategy {
      rolling_update {
        max_unavailable = "1"
      }
    }

    min_ready_seconds      = 10
    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
