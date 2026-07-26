/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "openfga" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }
}
