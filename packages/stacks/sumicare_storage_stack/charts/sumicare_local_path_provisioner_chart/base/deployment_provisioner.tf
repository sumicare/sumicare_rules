/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

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
        volume {
          name = "config-volume"

          config_map {
            name = "local-path-config"
          }
        }

        container {
          name    = "local-path-provisioner"
          image   = "${var.image}:v${var.local_path_provisioner_version}"
          command = ["local-path-provisioner", "--debug", "start", "--config", "/etc/config/config.json", "--service-account-name", "local-path-storage-local-path-provisioner", "--provisioner-name", "cluster.local/local-path-storage-local-path-provisioner", "--helper-image", "busybox:latest", "--configmap-name", "local-path-config"]

          env {
            name = "POD_NAMESPACE"

            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }

          env {
            name  = "CONFIG_MOUNT_PATH"
            value = "/etc/config/"
          }

          volume_mount {
            name       = "config-volume"
            mount_path = "/etc/config/"
          }

          image_pull_policy = "IfNotPresent"
        }

        service_account_name = kubernetes_service_account.local_path_storage_local_path_provisioner.metadata[0].name
        host_users           = true
      }
    }

    revision_history_limit = var.revision_history_limit
  }
}
