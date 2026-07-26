/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "ballista_scheduler" {
  metadata {
    name      = "${local.app_name}-scheduler"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.scheduler_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.scheduler_labels
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
          name  = "${local.app_name}-scheduler"
          image = "${var.scheduler_image}:${var.ballista_version}"
          args  = ["--bind-port=50050"]

          port {
            name           = "flight"
            container_port = 50050
          }

          {{ VolumeMount "data" "/mnt" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = kubernetes_service_account.ballista_scheduler.metadata[0].name

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
