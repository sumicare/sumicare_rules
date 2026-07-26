/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "release_name_mimir_make_minio_buckets_5_4_0" {
  metadata {
    name      = "release-name-mimir-make-minio-buckets-5.4.0"
    namespace = var.namespace

    labels = {
      app      = "mimir-distributed-make-bucket-job"
      chart    = "mimir-distributed-6.0.3"
      heritage = "Helm"
      release  = "${var.org}-${var.env}"
    }
  }

  spec {
    template {
      metadata {
        labels = {
          app     = "mimir-distributed-job"
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

