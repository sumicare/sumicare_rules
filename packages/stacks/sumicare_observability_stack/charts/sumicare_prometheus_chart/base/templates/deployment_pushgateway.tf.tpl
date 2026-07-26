/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "prometheus_prometheus_pushgateway" {
  metadata {
    name        = "prometheus-prometheus-pushgateway"
    namespace   = var.namespace
    labels      = local.pushgateway_labels
  }

  spec {
    replicas = var.pushgateway_replicas

    selector {
      match_labels = local.pushgateway_labels
    }

    {{ DeploymentRecreate }}

    template {
      metadata {
        labels = local.pushgateway_labels
      }

      spec {
        service_account_name = kubernetes_service_account.prometheus_prometheus_pushgateway.metadata[0].name

        {{ VolumeEmptyDir "storage-volume" }}

        container {
          name    = "pushgateway"
          image   = "${var.pushgateway_image}:v${var.pushgateway_version}"

          port {
            name           = "metrics"
            container_port = 9091
            protocol       = "TCP"
          }

          {{ ContainerResources }}

          {{ VolumeMount "storage-volume" "/data" }}

          {{ LivenessProbe "/-/healthy" "9091" "HTTP" }}

          {{ ReadinessProbe "/-/ready" "9091" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
