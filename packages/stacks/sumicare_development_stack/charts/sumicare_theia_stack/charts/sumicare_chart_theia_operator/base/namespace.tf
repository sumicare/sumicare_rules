/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_namespace" "tekton_operator" {
  metadata {
    name   = var.namespace
    labels = local.labels
  }
}
