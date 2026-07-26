/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "local_path_storage_local_path_provisioner" {
  metadata {
    name      = "local-path-storage-local-path-provisioner"
    namespace = var.namespace
    labels    = local.provisioner_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.provisioner_labels
    }

    template {
      metadata {
        labels = local.provisioner_labels
      }

      spec {
        {{ VolumeConfigMap "config-volume" "local-path-config" }}

        container {
          name    = "local-path-provisioner"
          image   = "${var.image}:v${var.local_path_provisioner_version}"
          command = ["local-path-provisioner", "--debug", "start", "--config", "/etc/config/config.json", "--service-account-name", "local-path-storage-local-path-provisioner", "--provisioner-name", "cluster.local/local-path-storage-local-path-provisioner", "--helper-image", "busybox:latest", "--configmap-name", "local-path-config"]

          {{ EnvFromFieldRef "POD_NAMESPACE" "metadata.namespace" }}

          env {
            name  = "CONFIG_MOUNT_PATH"
            value = "/etc/config/"
          }

          {{ VolumeMount "config-volume" "/etc/config/" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        service_account_name = kubernetes_service_account.local_path_storage_local_path_provisioner.metadata[0].name
        host_users           = true
      }
    }

    revision_history_limit = var.revision_history_limit
  }
}
