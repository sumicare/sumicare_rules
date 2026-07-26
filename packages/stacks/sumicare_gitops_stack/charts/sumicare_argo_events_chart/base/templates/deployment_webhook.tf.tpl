/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "events_webhook" {
  metadata {
    name      = "${local.app_name}-events-webhook"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.webhook_replicas

    selector {
      match_labels = local.webhook_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.webhook_labels
      }

      spec {
        container {
          name  = "events-webhook"
          image = "${var.image}:v${var.argo_events_version}"
          args  = ["webhook-service"]

          port {
            name           = "webhook"
            container_port = 443
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "NAMESPACE" "metadata.namespace" }}

          env {
            name  = "PORT"
            value = "443"
          }

          {{ ContainerResources }}

          liveness_probe {
            tcp_socket {
              port = "webhook"
            }

            initial_delay_seconds = var.liveness_probe_initial_delay
            timeout_seconds       = var.liveness_probe_timeout
            period_seconds        = var.liveness_probe_period
            success_threshold     = 1
            failure_threshold     = var.liveness_probe_failure_threshold
          }

          readiness_probe {
            tcp_socket {
              port = "webhook"
            }

            initial_delay_seconds = var.readiness_probe_initial_delay
            timeout_seconds       = var.readiness_probe_timeout
            period_seconds        = var.readiness_probe_period
            success_threshold     = 1
            failure_threshold     = var.readiness_probe_failure_threshold
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = kubernetes_service_account.argo_events_events_webhook.metadata[0].name

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.webhook_labels" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
