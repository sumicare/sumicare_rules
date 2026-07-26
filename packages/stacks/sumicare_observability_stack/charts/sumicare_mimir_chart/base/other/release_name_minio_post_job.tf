/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "release_name_minio_post_job" {
  metadata {
    name = "release-name-minio-post-job"

    labels = {
      app      = "minio-post-job"
      chart    = "minio-5.4.0"
      heritage = "Helm"
      release  = "${var.org}-${var.env}"
    }

    annotations = {
      "helm.sh/hook"               = "post-install,post-upgrade"
      "helm.sh/hook-delete-policy" = "hook-succeeded,before-hook-creation"
    }
  }

  spec {
    template {
      metadata {
        labels = {
          app     = "minio-job"
          release = "${var.org}-${var.env}"
        }
      }

      spec {
        volume {
          name      = "etc-path"
          empty_dir = {}
        }

        volume {
          name      = "tmp"
          empty_dir = {}
        }

        volume {
          name = "minio-configuration"

          projected {
            sources {
              config_map {
                name = "release-name-minio"
              }
            }

            sources {
              secret {
                name = "release-name-minio"
              }
            }
          }
        }

        container {
          name    = "minio-make-bucket"
          image   = "quay.io/minio/mc:RELEASE.2024-11-21T17-21-54Z"
          command = ["/bin/sh", "/config/initialize"]

          env {
            name  = "MINIO_ENDPOINT"
            value = "release-name-minio"
          }

          env {
            name  = "MINIO_PORT"
            value = "9000"
          }

          resources {
            requests = {
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "etc-path"
            mount_path = "/etc/minio/mc"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "minio-configuration"
            mount_path = "/config"
          }

          image_pull_policy = "IfNotPresent"
        }

        container {
          name    = "minio-make-user"
          image   = "quay.io/minio/mc:RELEASE.2024-11-21T17-21-54Z"
          command = ["/bin/sh", "/config/add-user"]

          env {
            name  = "MINIO_ENDPOINT"
            value = "release-name-minio"
          }

          env {
            name  = "MINIO_PORT"
            value = "9000"
          }

          resources {
            requests = {
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "etc-path"
            mount_path = "/etc/minio/mc"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "minio-configuration"
            mount_path = "/config"
          }

          image_pull_policy = "IfNotPresent"
        }

        restart_policy       = "OnFailure"
        service_account_name = "minio-sa"
      }
    }
  }
}

