/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_grafana_mcp" {
  metadata {
    name      = "release-name-grafana-mcp"
    namespace = "grafana-mcp"

    labels = {
      "app.kubernetes.io/component" = "mcp-server"
      "app.kubernetes.io/instance"  = "release-name"
      "app.kubernetes.io/name"      = "grafana-mcp"
      "app.kubernetes.io/version"   = "0.7.8"
    }
  }

  spec {
    port {
      name        = "mcp-http"
      protocol    = "TCP"
      port        = 8000
      target_port = "mcp-http"
    }

    selector = {
      "app.kubernetes.io/component" = "mcp-server"
      "app.kubernetes.io/instance"  = "release-name"
      "app.kubernetes.io/name"      = "grafana-mcp"
    }

    type = "ClusterIP"
  }
}

