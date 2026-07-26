/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_job" "release_name_mimir_smoke_test" {
  metadata {
    name      = "release-name-mimir-smoke-test"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "smoke-test"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "mimir"
      "app.kubernetes.io/version"    = "3.0.0"
    }

    annotations = {
      "helm.sh/hook" = "test"
    }
  }

  spec {
    parallelism   = 1
    completions   = 1
    backoff_limit = 5

    template {
      metadata {
        labels = {
          "app.kubernetes.io/component"  = "smoke-test"
          "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
          "app.kubernetes.io/name"       = "mimir"
          "app.kubernetes.io/version"    = "3.0.0"
        }
      }

      spec {
        container {
          name              = "smoke-test"
          image             = "grafana/mimir:3.0.0"
          args              = ["-target=continuous-test", "-activity-tracker.filepath=", "-tests.smoke-test", "-tests.write-endpoint=http://release-name-mimir-gateway.mimir.svc:80", "-tests.read-endpoint=http://release-name-mimir-gateway.mimir.svc:80/prometheus", "-tests.tenant-id=", "-tests.write-read-series-test.num-series=1000", "-tests.write-read-series-test.max-query-age=48h", "-server.http-listen-port=8080"]
          image_pull_policy = "IfNotPresent"
        }

        restart_policy       = "OnFailure"
        service_account_name = "release-name-mimir"

        security_context {
          run_as_user     = 10001
          run_as_group    = 10001
          run_as_non_root = true
          fs_group        = 10001

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }
      }
    }
  }
}

