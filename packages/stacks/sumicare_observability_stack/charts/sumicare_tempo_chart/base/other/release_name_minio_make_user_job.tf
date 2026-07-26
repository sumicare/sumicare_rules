/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "release_name_minio_make_user_job" {
  metadata {
    name      = "release-name-minio-make-user-job"
    namespace = var.namespace

    labels = {
      app      = "minio-make-user-job"
      chart    = "minio-4.0.12"
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
          name    = "minio-mc"
          image   = "quay.io/minio/mc:RELEASE.2022-08-11T00-30-48Z"
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
            name       = "minio-configuration"
            mount_path = "/config"
          }

          image_pull_policy = "IfNotPresent"
        }

        restart_policy = "OnFailure"
      }
    }
  }
}

