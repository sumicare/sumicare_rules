/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service" "ballista_scheduler" {
  metadata {
    name = "ballista-scheduler"

    labels = {
      app = "ballista-scheduler"
    }
  }

  spec {
    port {
      name = "scheduler"
      port = 50050
    }

    port {
      name = "scheduler-ui"
      port = 80
    }

    selector = {
      app = "ballista-scheduler"
    }
  }
}

resource "kubernetes_service" "ballista_executor" {
  metadata {
    name = "ballista-executor"

    labels = {
      app = "ballista-executor"
    }
  }

  spec {
    port {
      name = "executor"
      port = 50051
    }

    selector = {
      app = "ballista-executor"
    }
  }
}
