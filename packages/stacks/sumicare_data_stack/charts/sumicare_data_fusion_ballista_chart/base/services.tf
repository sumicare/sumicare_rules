/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service" "ballista_scheduler" {
  metadata {
    name      = "${local.app_name}-scheduler"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "scheduler"
      protocol    = "TCP"
      port        = 50050
      target_port = "scheduler"
    }

    port {
      name        = "scheduler-ui"
      protocol    = "TCP"
      port        = 80
      target_port = "scheduler-ui"
    }

    selector = local.scheduler_labels
    type     = "ClusterIP"
  }
}

resource "kubernetes_service" "ballista_executor" {
  metadata {
    name      = "${local.app_name}-executor"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    port {
      name        = "executor"
      protocol    = "TCP"
      port        = 50051
      target_port = "executor"
    }

    selector = local.executor_labels
    type     = "ClusterIP"
  }
}
