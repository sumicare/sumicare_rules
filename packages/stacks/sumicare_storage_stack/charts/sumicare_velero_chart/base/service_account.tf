/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "velero_server" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "velero_server_upgrade_crds" {
  metadata {
    name      = "${local.app_name}-upgrade-crds"
    namespace = var.namespace
    labels    = local.labels
  }
}
