/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "velero_upgrade_crds" {
  metadata {
    name      = "velero-upgrade-crds"
    namespace = "velero"

    labels = {
      "app.kubernetes.io/instance"   = "velero"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "velero"
      "helm.sh/chart"                = "velero-11.4.0"
    }

    annotations = {
      "helm.sh/hook"               = "pre-install,pre-upgrade,pre-rollback"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded"
      "helm.sh/hook-weight"        = "5"
    }
  }

  spec {
    backoff_limit = 3

    template {
      metadata {
        name = "velero-upgrade-crds"
      }

      spec {
        volume {
          name      = "crds"
          empty_dir = {}
        }

        init_container {
          name    = "kubectl"
          image   = "docker.io/bitnamilegacy/kubectl:1.35"
          command = ["/bin/sh"]
          args    = ["-c", "cp `which sh` /tmp && cp `which kubectl` /tmp"]

          volume_mount {
            name       = "crds"
            mount_path = "/tmp"
          }

          image_pull_policy = "IfNotPresent"
        }

        container {
          name    = "velero"
          image   = "docker.io/velero/velero:v1.17.1"
          command = ["/tmp/sh"]
          args    = ["-c", "/velero install --crds-only --dry-run -o yaml | /tmp/kubectl apply -f -"]

          volume_mount {
            name       = "crds"
            mount_path = "/tmp"
          }

          image_pull_policy = "IfNotPresent"
        }

        restart_policy                  = "OnFailure"
        service_account_name            = "velero-server-upgrade-crds"
        automount_service_account_token = true
      }
    }
  }
}

