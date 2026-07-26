/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service" "external_dns" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 7979
      target_port = "http"
    }

    selector = local.controller_labels
    type     = "ClusterIP"
  }
}
