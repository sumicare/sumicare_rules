/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "pyroscope_memberlist" {
  metadata {
    name      = "${local.app_name}-memberlist"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "memberlist"
      protocol    = "TCP"
      port        = 7946
      target_port = "7946"
    }

    selector = local.server_labels

    cluster_ip                  = "None"
    type                        = "ClusterIP"
    publish_not_ready_addresses = true
  }
}

resource "kubernetes_service" "pyroscope" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.server_labels
  }

  spec {
    port {
      name        = "http2"
      protocol    = "TCP"
      port        = 4040
      target_port = "http2"
    }

    selector = local.server_labels

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "pyroscope_headless" {
  metadata {
    name      = "${local.app_name}-headless"
    namespace = var.namespace
    labels    = local.server_labels
  }

  spec {
    port {
      name        = "http2"
      protocol    = "TCP"
      port        = 4040
      target_port = "http2"
    }

    selector = local.server_labels

    cluster_ip = "None"
    type       = "ClusterIP"
  }
}
