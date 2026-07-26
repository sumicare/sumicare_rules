/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_horizontal_pod_autoscaler" "release_name_tempo_compactor" {
  metadata {
    name      = "release-name-tempo-compactor"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "compactor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
      "app.kubernetes.io/version"   = "2.9.0"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-tempo-compactor"
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
          average_utilization = 100
        }
      }
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler" "release_name_tempo_distributor" {
  metadata {
    name      = "release-name-tempo-distributor"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "distributor"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
      "app.kubernetes.io/version"   = "2.9.0"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-tempo-distributor"
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

resource "kubernetes_horizontal_pod_autoscaler" "release_name_tempo_querier" {
  metadata {
    name      = "release-name-tempo-querier"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "querier"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
      "app.kubernetes.io/version"   = "2.9.0"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-tempo-querier"
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

resource "kubernetes_horizontal_pod_autoscaler" "release_name_tempo_query_frontend" {
  metadata {
    name      = "release-name-tempo-query-frontend"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component" = "query-frontend"
      "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
      "app.kubernetes.io/name"      = "tempo"
      "app.kubernetes.io/version"   = "2.9.0"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-tempo-query-frontend"
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

