/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_pod" "release_name_grafana_test" {
  metadata {
    name      = "release-name-grafana-test"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "grafana"
      "app.kubernetes.io/version"  = "12.2.1"
    }

    annotations = {
      "helm.sh/hook"               = "test"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded"
    }
  }

  spec {
    volume {
      name = "tests"

      config_map {
        name = "release-name-grafana-test"
      }
    }

    container {
      name    = "release-name-test"
      image   = "docker.io/bats/bats:v1.4.1"
      command = ["/opt/bats/bin/bats", "-t", "/tests/run.sh"]

      volume_mount {
        name       = "tests"
        read_only  = true
        mount_path = "/tests"
      }

      image_pull_policy = "IfNotPresent"
    }

    restart_policy       = "Never"
    service_account_name = "release-name-grafana-test"
  }
}

