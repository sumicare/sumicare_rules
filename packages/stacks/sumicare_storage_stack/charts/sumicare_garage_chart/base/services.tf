/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "garage_headless" {
  metadata {
    name = "garage-headless"

    labels = {
      "app.kubernetes.io/instance"   = "garage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "garage"
      "app.kubernetes.io/version"    = "v2.2.0"
      "helm.sh/chart"                = "garage-0.9.2"
    }
  }

  spec {
    port {
      name        = "s3-api"
      protocol    = "TCP"
      port        = 3900
      target_port = "3900"
    }

    port {
      name        = "s3-web"
      protocol    = "TCP"
      port        = 3902
      target_port = "3902"
    }

    selector = {
      "app.kubernetes.io/instance" = "garage"
      "app.kubernetes.io/name"     = "garage"
    }

    cluster_ip = "None"
    type       = "ClusterIP"
  }
}

resource "kubernetes_service" "garage" {
  metadata {
    name = "garage"

    labels = {
      "app.kubernetes.io/instance"   = "garage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "garage"
      "app.kubernetes.io/version"    = "v2.2.0"
      "helm.sh/chart"                = "garage-0.9.2"
    }
  }

  spec {
    port {
      name        = "s3-api"
      protocol    = "TCP"
      port        = 3900
      target_port = "3900"
    }

    port {
      name        = "s3-web"
      protocol    = "TCP"
      port        = 3902
      target_port = "3902"
    }

    selector = {
      "app.kubernetes.io/instance" = "garage"
      "app.kubernetes.io/name"     = "garage"
    }

    type = "ClusterIP"
  }
}

