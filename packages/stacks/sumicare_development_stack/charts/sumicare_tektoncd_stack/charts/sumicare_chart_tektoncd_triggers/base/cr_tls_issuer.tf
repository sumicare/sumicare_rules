/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_manifest" "issuer_tekton_operator_issuer" {
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "Issuer"
    metadata = {
      name      = "${local.app_name}-issuer"
      namespace = var.namespace
      labels    = local.labels
    }
    spec = {
      ca = {
        secretName = "${var.org}-ca"
      }
    }
  }
}

resource "kubernetes_manifest" "issuer_tekton_operator_selfsigned_issuer" {
  manifest = {
    apiVersion = "cert-manager.io/v1"
    kind       = "Issuer"
    metadata = {
      name      = "${local.app_name}-selfsigned-issuer"
      namespace = var.namespace
      labels    = local.labels
    }
    spec = {
      selfSigned = {}
      namespace  = var.namespace
    }
  }
}
