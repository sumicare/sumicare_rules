/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

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

          {{ ContainerResources }}

          {{ Probe "readiness" "/ready" "8001" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = "${local.app_name}-rollout-operator"

        {{ PodSecurityContext }}
      }
    }
  }

  {{ LifecycleIgnoreVPAChanges }}
}
