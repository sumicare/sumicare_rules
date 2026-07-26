/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_horizontal_pod_autoscaler" "release_name_loki_distributor" {
  metadata {
    name      = "release-name-loki-distributor"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "distributor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "loki"
      "app.kubernetes.io/version"   = "3.5.7"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-loki-distributor"
      api_version = "apps/v1"
    }

    min_replicas = 1
    max_replicas = 3

    metric {
      type = "Resource"

      resource {
        name = "cpu"

        target {
          type                = "Utilization"
          average_utilization = 60
        }
      }
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler" "release_name_loki_querier" {
  metadata {
    name      = "release-name-loki-querier"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "querier"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "loki"
      "app.kubernetes.io/version"   = "3.5.7"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-loki-querier"
      api_version = "apps/v1"
    }

    min_replicas = 1
    max_replicas = 3

    metric {
      type = "Resource"

      resource {
        name = "cpu"

        target {
          type                = "Utilization"
          average_utilization = 60
        }
      }
    }
  }
}

