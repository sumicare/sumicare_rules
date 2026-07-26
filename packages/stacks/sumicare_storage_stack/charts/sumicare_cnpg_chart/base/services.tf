/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "barman_cloud" {
  metadata {
    name      = "barman-cloud"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"   = "plugin-barman-cloud"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "plugin-barman-cloud"
      "app.kubernetes.io/version"    = "v0.11.0"
      "cnpg.io/pluginName"           = "barman-cloud.cloudnative-pg.io"
      "helm.sh/chart"                = "plugin-barman-cloud-0.5.0"
    }

    annotations = {
      "cnpg.io/pluginClientSecret" = "barman-cloud-client-tls"
      "cnpg.io/pluginPort"         = "9090"
      "cnpg.io/pluginServerSecret" = "barman-cloud-server-tls"
    }
  }

  spec {
    port {
      protocol    = "TCP"
      port        = 9090
      target_port = "9090"
    }

    selector = {
      "app.kubernetes.io/instance" = "plugin-barman-cloud"
      "app.kubernetes.io/name"     = "plugin-barman-cloud"
    }
  }
}

