/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service" "forgejo_http" {
  metadata {
    name      = "${local.app_name}-http"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 3000
      target_port = "http"
    }

    selector = local.selector_labels
    type     = "ClusterIP"
  }
}

resource "kubernetes_service" "forgejo_ssh" {
  metadata {
    name      = "${local.app_name}-ssh"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "ssh"
      protocol    = "TCP"
      port        = 22
      target_port = "ssh"
    }

    selector = local.selector_labels
    type     = "ClusterIP"
  }
}
