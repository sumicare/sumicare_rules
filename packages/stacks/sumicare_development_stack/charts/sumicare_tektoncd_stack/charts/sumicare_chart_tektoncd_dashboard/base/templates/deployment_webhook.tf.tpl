/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "tekton_webhook" {
  metadata {
    name      = "${local.app_name}-webhook"
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
        {{ VolumeEmptyDir "webhook-certs" }}

        container {
          name  = "webhook"
          image = "${var.webhook_image}:v${var.tekton_operator_version}@${var.webhook_image_digest}"
          args  = ["-webhook-name=${local.app_name}-webhook", "-webhook-port=8443"]

          {{ EnvFromFieldRef "SYSTEM_NAMESPACE" "metadata.namespace" }}

          {{ EnvFromFieldRef "CONFIG_LOGGING_NAME" "metadata.name" }}

          env {
            name  = "CONFIG_OBSERVABILITY_NAME"
            value = "tekton-config-observability"
          }

          env {
            name  = "WEBHOOK_SERVICE_NAME"
            value = "${local.app_name}-webhook"
          }

          env {
            name  = "WEBHOOK_SECRET_NAME"
            value = "${local.app_name}-webhook-certs"
          }

          env {
            name  = "METRICS_DOMAIN"
            value = "tekton.dev/operator"
          }

          port {
            name           = "metrics"
            container_port = 9090
          }

          port {
            name           = "profiling"
            container_port = 8008
          }

          port {
            name           = "https-webhook"
            container_port = 8443
          }

          {{ VolumeMountReadOnly "webhook-certs" "/etc/webhook-certs" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        service_account_name = local.app_name

        {{ NodeAffinityWithPodAntiAffinity "local.webhook_labels" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
