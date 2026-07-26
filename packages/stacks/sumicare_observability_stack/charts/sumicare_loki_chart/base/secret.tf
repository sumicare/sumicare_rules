/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "loki_distributed_basic_auth" {
  metadata {
    name = "loki-distributed-basic-auth"
  }

  type = "Opaque"
}

