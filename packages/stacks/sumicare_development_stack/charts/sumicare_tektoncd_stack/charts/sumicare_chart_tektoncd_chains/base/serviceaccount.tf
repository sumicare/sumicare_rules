/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "tekton_operator" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }
}
