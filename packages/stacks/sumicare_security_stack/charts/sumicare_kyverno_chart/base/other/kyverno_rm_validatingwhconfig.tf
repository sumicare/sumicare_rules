/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "kyverno_rm_validatingwhconfig" {
  metadata {
    name      = "kyverno-rm-validatingwhconfig"
    namespace = "kyverno"

    labels = {
      "app.kubernetes.io/component"  = "hooks"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }

    annotations = {
      "helm.sh/hook"               = "pre-delete"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded,hook-failed"
      "helm.sh/hook-weight"        = "100"
    }
  }

  spec {
    backoff_limit = 2

    template {
      metadata {}

      spec {
        container {
          name    = "kubectl"
          image   = "registry.k8s.io/kubectl:v1.34.3"
          command = ["kubectl", "delete", "validatingwebhookconfiguration", "-l", "webhook.kyverno.io/managed-by=kyverno"]

          resources {
            limits = {
              cpu    = "100m"
              memory = "256Mi"
            }

            requests = {
              cpu    = "10m"
              memory = "64Mi"
            }
          }

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            run_as_user               = 65534
            run_as_group              = 65534
            run_as_non_root           = true
            read_only_root_filesystem = true

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        restart_policy                  = "Never"
        service_account_name            = "kyverno-admission-controller"
        automount_service_account_token = true
      }
    }
  }
}

