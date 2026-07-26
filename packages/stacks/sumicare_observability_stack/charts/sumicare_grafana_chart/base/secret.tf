/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "grafana_config_secret" {
  metadata {
    name      = "release-name-grafana-config-secret"
    namespace = "${local.app_name}"

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "${local.app_name}"
      "app.kubernetes.io/version"  = "12.2.1"
    }
  }

  data = {
    "contactpoints.yaml" = file("${module_path}/contactpoints.yaml")
  }
}
