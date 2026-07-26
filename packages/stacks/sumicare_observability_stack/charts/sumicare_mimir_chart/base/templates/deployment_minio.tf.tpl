/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

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

        {{ VolumeSecret "minio-user" "${local.app_name}-minio" }}

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

          {{ EnvFromSecretRef "MINIO_ROOT_USER" "${local.app_name}-minio" "rootUser" }}

          {{ EnvFromSecretRef "MINIO_ROOT_PASSWORD" "${local.app_name}-minio" "rootPassword" }}

          env {
            name  = "MINIO_PROMETHEUS_AUTH_TYPE"
            value = "public"
          }

          {{ ContainerResources }}

          {{ VolumeMountReadOnly "minio-user" "/tmp/credentials" }}

          {{ VolumeMount "export" "/export" }}

          {{ ImagePullPolicyIfNotPresent }}
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

  {{ LifecycleIgnoreVPAChanges }}
}
