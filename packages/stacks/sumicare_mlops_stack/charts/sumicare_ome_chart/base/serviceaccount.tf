/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "ome_model_agent" {
  metadata {
    name      = "ome-model-agent"
    namespace = "ome"

    labels = {
      "app.kubernetes.io/component" = "ome-model-agent-daemonset"
    }
  }
}

resource "kubernetes_service_account" "ome_controller_manager" {
  metadata {
    name = "ome-controller-manager"

    labels = {
      "app.kubernetes.io/instance"   = "ome-controller-manager"
      "app.kubernetes.io/managed-by" = "ome-controller-manager"
      "app.kubernetes.io/name"       = "ome-controller-manager"
    }
  }
}

