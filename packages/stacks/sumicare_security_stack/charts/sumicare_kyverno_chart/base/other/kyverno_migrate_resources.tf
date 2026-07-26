/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "kyverno_migrate_resources" {
  metadata {
    name      = "kyverno-migrate-resources"
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
      "helm.sh/hook"        = "post-upgrade"
      "helm.sh/hook-weight" = "200"
    }
  }

  spec {
    backoff_limit = 2

    template {
      metadata {}

      spec {
        container {
          name  = "kubectl"
          image = "reg.kyverno.io/kyverno/kyverno-cli:v1.17.1"
          args  = ["migrate", "--resource", "cleanuppolicies.kyverno.io", "--resource", "clustercleanuppolicies.kyverno.io", "--resource", "clusterpolicies.kyverno.io", "--resource", "globalcontextentries.kyverno.io", "--resource", "policies.kyverno.io", "--resource", "policyexceptions.kyverno.io", "--resource", "updaterequests.kyverno.io", "--resource", "deletingpolicies.policies.kyverno.io", "--resource", "generatingpolicies.policies.kyverno.io", "--resource", "imagevalidatingpolicies.policies.kyverno.io", "--resource", "mutatingpolicies.policies.kyverno.io", "--resource", "namespaceddeletingpolicies.policies.kyverno.io", "--resource", "namespacedgeneratingpolicies.policies.kyverno.io", "--resource", "namespacedimagevalidatingpolicies.policies.kyverno.io", "--resource", "namespacedmutatingpolicies.policies.kyverno.io", "--resource", "namespacedvalidatingpolicies.policies.kyverno.io", "--resource", "policyexceptions.policies.kyverno.io", "--resource", "validatingpolicies.policies.kyverno.io"]

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

          image_pull_policy = "IfNotPresent"

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
        service_account_name            = "kyverno-migrate-resources"
        automount_service_account_token = true
      }
    }
  }
}

