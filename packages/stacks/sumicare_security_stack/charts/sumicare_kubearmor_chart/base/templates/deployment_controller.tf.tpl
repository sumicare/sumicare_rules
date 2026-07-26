/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "kubearmor_controller" {
  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.controller_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.controller_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.controller_labels
      }

      spec {
        {{ VolumeSecret "cert" "kubearmor-controller-webhook-server-cert" }}

        volume {
          name = "sys-path"

          host_path {
            path = "/sys/kernel/security"
            type = "Directory"
          }
        }

        container {
          name    = "manager"
          image   = "${var.image}:v${var.kubearmor_version}"
          command = ["/manager"]
          args    = ["--annotateExisting=false"]

          port {
            name           = "webhook-server"
            container_port = 9443
            protocol       = "TCP"
          }

          {{ VolumeMountReadOnly "cert" "/tmp/k8s-webhook-server/serving-certs" }}

          {{ VolumeMount "sys-path" "/sys/kernel/security" }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 10
        service_account_name             = kubernetes_service_account.kubearmor_controller.metadata[0].name

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
