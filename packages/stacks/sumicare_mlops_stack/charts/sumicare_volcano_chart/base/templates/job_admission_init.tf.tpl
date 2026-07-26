/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_job" "release_name_admission_init" {
  metadata {
    name      = "release-name-admission-init"
    namespace = var.namespace

    labels = {
      app = "volcano-admission-init"
    }

    annotations = {
      "helm.sh/hook"               = "pre-install,pre-upgrade"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded"
      "helm.sh/hook-weight"        = "5"
    }
  }

  spec {
    backoff_limit = 3

    template {
      metadata {}

      spec {
        container {
          name              = "main"
          image             = "${var.webhook_image}:${var.volcano_version}"
          command           = ["./gen-admission-secret.sh", "--service", "release-name-admission-service", "--namespace", var.namespace, "--secret", "volcano-admission-secret"]
          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              add  = ["DAC_OVERRIDE"]
              drop = ["ALL"]
            }

            run_as_user     = 1000
            run_as_non_root = true
          }
        }

        restart_policy       = "Never"
        service_account_name = "release-name-admission-init"

        security_context {
          se_linux_option {
            level = "s0:c123,c456"
          }

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }

        priority_class_name = "system-cluster-critical"
      }
    }
  }
}
