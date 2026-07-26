/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "release_name_grafana_mcp" {
  metadata {
    name      = "release-name-grafana-mcp"
    namespace = "grafana-mcp"

    labels = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "grafana-mcp"
      "app.kubernetes.io/version"  = "0.7.8"
    }
  }
}

