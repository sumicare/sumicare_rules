/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "release_name_alloy" {
  metadata {
    name      = "release-name-alloy"
    namespace = "alloy"

    labels = {
      "app.kubernetes.io/component"  = "rbac"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  automount_service_account_token = true
}

