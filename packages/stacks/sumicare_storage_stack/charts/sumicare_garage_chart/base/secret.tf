/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "garage_rpc_secret" {
  metadata {
    name = "garage-rpc-secret"

    labels = {
      "app.kubernetes.io/instance"   = "garage"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "garage"
      "app.kubernetes.io/version"    = "v2.2.0"
      "helm.sh/chart"                = "garage-0.9.2"
    }
  }

  data = {
    rpcSecret = "3aaa2f914ef80563f2a810a94be935710c4388c9c80d8d7c881adae1ca87806b"
  }

  type = "Opaque"
}

