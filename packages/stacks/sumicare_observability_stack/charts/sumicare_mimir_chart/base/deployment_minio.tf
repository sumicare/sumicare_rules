/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "mimir_minio" {
  metadata {
    name      = "${local.app_name}-minio"
    namespace = var.namespace

    labels = merge(local.minio_labels, {
      chart    = "minio-5.4.0"
      heritage = "Helm"
    })
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.minio_labels
    }

    template {
      metadata {
        name   = "${local.app_name}-minio"
        labels = local.minio_labels
      }

      spec {
        volume {
          name = "export"

          persistent_volume_claim {
            claim_name = "${local.app_name}-minio"
          }
        }

        volume {
          name = "minio-user"

          secret {
            secret_name = "${local.app_name}-minio"
          }
        }

        container {
          name    = "minio"
          image   = "${var.minio_image}:${var.minio_version}"
          command = ["/bin/sh", "-ce", "/usr/bin/docker-entrypoint.sh minio server /export -S /etc/minio/certs/ --address :9000 --console-address :9001"]

          port {
            name           = "http"
            container_port = 9000
          }

          port {
            name           = "http-console"
            container_port = 9001
          }

          env {
            name = "MINIO_ROOT_USER"

            value_from {
              secret_key_ref {
                name = "${local.app_name}-minio"
                key  = "rootUser"
              }
            }
          }

          env {
            name = "MINIO_ROOT_PASSWORD"

            value_from {
              secret_key_ref {
                name = "${local.app_name}-minio"
                key  = "rootPassword"
              }
            }
          }

          env {
            name  = "MINIO_PROMETHEUS_AUTH_TYPE"
            value = "public"
          }

          
resources {
            limits = {
              cpu    = var.resources.limits.cpu
              memory = var.resources.limits.memory
            }

            requests = {
              cpu    = var.resources.requests.cpu
              memory = var.resources.requests.memory
            }
          }

          volume_mount {
            name       = "minio-user"
            read_only  = true
            mount_path = "/tmp/credentials"
          }

          volume_mount {
            name       = "export"
            mount_path = "/export"
          }

          image_pull_policy = "IfNotPresent"
        }

        service_account_name = "minio-sa"

        security_context {
          run_as_user            = 1000
          run_as_group           = 1000
          fs_group               = 1000
          fs_group_change_policy = "OnRootMismatch"
        }
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_surge = "100%"
      }
    }
  }

  lifecycle {
    # This is managed by VPA recommender
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].resources.requests,
      spec[0].template[0].spec[0].container[0].resources.limits,
    ]
  }
}
