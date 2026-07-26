/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_persistent_volume_claim" "forgejo_data" {
  metadata {
    name      = local.pvc_name
    namespace = var.namespace
    labels    = local.labels

    annotations = {
      "helm.sh/resource-policy" = "keep"
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "10Gi"
      }
    }

    volume_mode = "Filesystem"
  }
}
