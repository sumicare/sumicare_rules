/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service" "ome_webhook_server_service" {
  metadata {
    name      = "${local.app_name}-webhook-server-service"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "https"
      protocol    = "TCP"
      port        = 443
      target_port = "webhook-server"
    }

    selector = local.controller_labels
    type     = "ClusterIP"
  }
}

resource "kubernetes_service" "ome_controller_manager_service" {
  metadata {
    name      = "${local.app_name}-controller-manager-service"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "https"
      protocol    = "TCP"
      port        = 8443
      target_port = "https"
    }

    selector = local.controller_labels
    type     = "ClusterIP"
  }
}
