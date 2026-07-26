/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "ballista_executor" {
  metadata {
    name      = "${local.app_name}-executor"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = 2

    selector {
      match_labels = local.executor_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.executor_labels
      }

      spec {
        volume {
          name = "data"

          host_path {
            path = "/mnt"
            type = "DirectoryOrCreate"
          }
        }

        container {
          name  = "${local.app_name}-executor"
          image = "${var.executor_image}:${var.ballista_version}"
          args  = ["--bind-port=50051", "--scheduler-host=${local.app_name}-scheduler", "--scheduler-port=50050"]

          port {
            name           = "flight"
            container_port = 50051
          }

          {{ VolumeMount "data" "/mnt" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = kubernetes_service_account.ballista_executor.metadata[0].name

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
