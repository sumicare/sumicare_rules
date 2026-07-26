/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "release_name_tempo_compactor" {
  metadata {
    name      = "release-name-tempo-compactor"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "compactor"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 3200
      target_port = "http-metrics"
    }

    selector = {
      "app.kubernetes.io/component" = "compactor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    type             = "ClusterIP"
    ip_families      = ["IPv4"]
    ip_family_policy = "SingleStack"
  }
}

resource "kubernetes_service" "release_name_tempo_distributor_discovery" {
  metadata {
    name      = "release-name-tempo-distributor-discovery"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"   = "distributor"
      "app.kubernetes.io/instance"    = "${var.org}-${var.env}"
      "app.kubernetes.io/managed-by"  = "Helm"
      "app.kubernetes.io/name"        = "tempo"
      "app.kubernetes.io/version"     = "2.9.0"
      "prometheus.io/service-monitor" = "false"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      port        = 3200
      target_port = "http-metrics"
    }

    selector = {
      "app.kubernetes.io/component" = "distributor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    cluster_ip = "None"
    type       = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_tempo_distributor" {
  metadata {
    name      = "release-name-tempo-distributor"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "distributor"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "9095"
    }

    selector = {
      "app.kubernetes.io/component" = "distributor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    type                    = "ClusterIP"
    ip_families             = ["IPv4"]
    ip_family_policy        = "SingleStack"
    internal_traffic_policy = "Cluster"
  }
}

resource "kubernetes_service" "release_name_tempo_gossip_ring" {
  metadata {
    name      = "release-name-tempo-gossip-ring"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "gossip-ring"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "gossip-ring"
      protocol    = "TCP"
      port        = 7946
      target_port = "7946"
    }

    selector = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "tempo"
      "app.kubernetes.io/part-of"  = "memberlist"
    }

    cluster_ip                  = "None"
    type                        = "ClusterIP"
    publish_not_ready_addresses = true
    ip_families                 = ["IPv4"]
    ip_family_policy            = "SingleStack"
  }
}

resource "kubernetes_service" "release_name_tempo_ingester_discovery" {
  metadata {
    name      = "release-name-tempo-ingester-discovery"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"   = "ingester"
      "app.kubernetes.io/instance"    = "${var.org}-${var.env}"
      "app.kubernetes.io/managed-by"  = "Helm"
      "app.kubernetes.io/name"        = "tempo"
      "app.kubernetes.io/version"     = "2.9.0"
      "prometheus.io/service-monitor" = "false"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "grpc"
    }

    selector = {
      "app.kubernetes.io/component" = "ingester"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    cluster_ip = "None"
    type       = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_tempo_ingester" {
  metadata {
    name      = "release-name-tempo-ingester"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "ingester"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "grpc"
    }

    selector = {
      "app.kubernetes.io/component" = "ingester"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    type                    = "ClusterIP"
    ip_families             = ["IPv4"]
    ip_family_policy        = "SingleStack"
    internal_traffic_policy = "Cluster"
  }
}

resource "kubernetes_service" "release_name_tempo_memcached" {
  metadata {
    name      = "release-name-tempo-memcached"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "memcached"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "memcached-client"
      port        = 11211
      target_port = "client"
    }

    port {
      name        = "http-metrics"
      port        = 9150
      target_port = "http-metrics"
    }

    selector = {
      "app.kubernetes.io/component" = "memcached"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    ip_families      = ["IPv4"]
    ip_family_policy = "SingleStack"
  }
}

resource "kubernetes_service" "release_name_tempo_querier" {
  metadata {
    name      = "release-name-tempo-querier"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "querier"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      protocol    = "TCP"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "9095"
    }

    selector = {
      "app.kubernetes.io/component" = "querier"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    ip_families      = ["IPv4"]
    ip_family_policy = "SingleStack"
  }
}

resource "kubernetes_service" "release_name_tempo_query_frontend_discovery" {
  metadata {
    name      = "release-name-tempo-query-frontend-discovery"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "query-frontend"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "grpc"
    }

    port {
      name        = "grpclb"
      protocol    = "TCP"
      port        = 9096
      target_port = "grpc"
    }

    selector = {
      "app.kubernetes.io/component" = "query-frontend"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    cluster_ip                  = "None"
    type                        = "ClusterIP"
    publish_not_ready_addresses = true
  }
}

resource "kubernetes_service" "release_name_tempo_query_frontend" {
  metadata {
    name      = "release-name-tempo-query-frontend"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "query-frontend"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "tempo"
      "app.kubernetes.io/version"    = "2.9.0"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      port        = 3200
      target_port = "http-metrics"
    }

    port {
      name        = "grpc"
      protocol    = "TCP"
      port        = 9095
      target_port = "grpc"
    }

    selector = {
      "app.kubernetes.io/component" = "query-frontend"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
    }

    type             = "ClusterIP"
    ip_families      = ["IPv4"]
    ip_family_policy = "SingleStack"
  }
}

