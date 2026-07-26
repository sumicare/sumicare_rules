/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "forgejo" {
  metadata {
    name      = local.deployment_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.selector_labels
    }

    template {
      metadata {
        labels = local.labels

        annotations = {
          "checksum/config" = sha256(kubernetes_secret.forgejo_inline_config.data["_generals_"])
        }
      }

      spec {
        volume {
          name = "init"

          secret {
            secret_name  = kubernetes_secret.forgejo_init.metadata[0].name
            default_mode = "0156"
          }
        }

        volume {
          name = "config"

          secret {
            secret_name  = kubernetes_secret.forgejo.metadata[0].name
            default_mode = "0156"
          }
        }

        volume {
          name = "inline-config-sources"

          secret {
            secret_name = kubernetes_secret.forgejo_inline_config.metadata[0].name
          }
        }

        {{ VolumeEmptyDir "temp" }}

        volume {
          name = "data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.forgejo_data.metadata[0].name
          }
        }

        init_container {
          name    = "init-directories"
          image   = "${var.image}:${var.forgejo_version}-rootless"
          command = ["/usr/sbin/init_directory_structure.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "init"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        init_container {
          name    = "init-app-ini"
          image   = "${var.image}:${var.forgejo_version}-rootless"
          command = ["/usr/sbin/config_environment.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          volume_mount {
            name       = "inline-config-sources"
            mount_path = "/env-to-ini-mounts/inlines/"
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        init_container {
          name    = "configure-gitea"
          image   = "${var.image}:${var.forgejo_version}-rootless"
          command = ["/usr/sbin/configure_gitea.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          env {
            name  = "HOME"
            value = "/data/gitea/git"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "init"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        container {
          name  = local.app_name
          image = "${var.image}:${var.forgejo_version}-rootless"

          port {
            name           = "ssh"
            container_port = 2222
          }

          port {
            name           = "http"
            container_port = 3000
          }

          env {
            name  = "SSH_LISTEN_PORT"
            value = "2222"
          }

          env {
            name  = "SSH_PORT"
            value = "22"
          }

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          env {
            name  = "TMPDIR"
            value = "/tmp/gitea"
          }

          env {
            name  = "HOME"
            value = "/data/gitea/git"
          }

          {{ ContainerResources }}

          {{ VolumeMount "temp" "/tmp" }}

          {{ VolumeMount "data" "/data" }}

          liveness_probe {
            tcp_socket {
              port = "http"
            }

            initial_delay_seconds = 200
            timeout_seconds       = 1
            period_seconds        = 10
            success_threshold     = 1
            failure_threshold     = 10
          }

          {{ ReadinessProbe "/api/healthz" "http" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        termination_grace_period_seconds = 60
        dns_policy                       = "ClusterFirst"
        service_account_name             = kubernetes_service_account.forgejo.metadata[0].name

        security_context {
          fs_group = 1000
        }

        priority_class_name = "system-cluster-critical"
      }
    }

    strategy {
      type = "Recreate"
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
