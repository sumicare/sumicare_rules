/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_pod" "kyverno_reports_controller_metrics" {
  metadata {
    name      = "kyverno-reports-controller-metrics"
    namespace = "kyverno"

    labels = {
      "app.kubernetes.io/component"  = "test"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }

    annotations = {
      "helm.sh/hook" = "test"
    }
  }

  spec {
    container {
      name  = "test"
      image = "ghcr.io/kyverno/readiness-checker:v0.1.0"
      args  = ["check-http", "--service-name=kyverno-reports-controller-metrics", "--namespace=kyverno", "--port=8000", "--path=metrics"]

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
    automount_service_account_token = true
  }
}

