/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_alloy_cluster" {
  metadata {
    name      = "release-name-alloy-cluster"
    namespace = "alloy"

    labels = {
      "app.kubernetes.io/component"  = "networking"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  spec {
    port {
      name        = "http"
      protocol    = "TCP"
      port        = 12345
      target_port = "12345"
    }

    selector = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "alloy"
    }

    cluster_ip                  = "None"
    type                        = "ClusterIP"
    publish_not_ready_addresses = true
  }
}

resource "kubernetes_service" "release_name_alloy" {
  metadata {
    name      = "release-name-alloy"
    namespace = "alloy"

    labels = {
      "app.kubernetes.io/component"  = "networking"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 12345
      target_port = "12345"
    }

    selector = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "alloy"
    }

    type                    = "ClusterIP"
    internal_traffic_policy = "Cluster"
  }
}

