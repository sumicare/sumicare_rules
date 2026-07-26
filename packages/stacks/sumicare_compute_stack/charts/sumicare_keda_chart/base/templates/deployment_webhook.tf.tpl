/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "keda_admission_webhook" {
  metadata {
    name      = "${local.app_name}-admission-webhooks"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.webhooks_replicas

    selector {
      match_labels = local.webhook_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels      = local.webhook_labels
        annotations = var.pod_annotations
      }

      spec {
        {{ VolumeSecret "certificates" "kedaorg-certs" }}

        container {
          name    = "keda-admission-webhooks"
          image   = "${var.webhooks_image}:${var.keda_version}"
          command = ["/keda-admission-webhooks"]
          args    = ["--zap-log-level=info", "--zap-encoder=console", "--zap-time-encoding=rfc3339", "--cert-dir=/certs", "--health-probe-bind-address=:8081", "--port=9443", "--metrics-bind-address=:8080"]

          port {
            name           = "http"
            container_port = 9443
            protocol       = "TCP"
          }

          env {
            name = "WATCH_NAMESPACE"
          }

          {{ EnvFromFieldRef "POD_NAME" "metadata.name" }}

          {{ EnvFromFieldRef "POD_NAMESPACE" "metadata.namespace" }}

          {{ ContainerResources }}

          {{ VolumeMountReadOnly "certificates" "/certs" }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name            = kubernetes_service_account.keda_webhook.metadata[0].name
        automount_service_account_token = true

        {{ PodSecurityContext }}

        enable_service_links = true

        {{ NodeAffinityWithPodAntiAffinity "local.webhook_labels" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.webhook_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
