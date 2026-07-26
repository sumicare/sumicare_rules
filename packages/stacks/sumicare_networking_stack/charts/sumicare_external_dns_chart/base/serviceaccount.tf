/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "release_name_external_dns" {
  metadata {
    name      = "release-name-external-dns"
    namespace = "external-dns"

    labels = {
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "external-dns"
      "app.kubernetes.io/version"    = "0.19.0"
    }
  }

  automount_service_account_token = true
}

