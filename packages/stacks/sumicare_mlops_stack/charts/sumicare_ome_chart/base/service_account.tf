/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "ome_model_agent" {
  metadata {
    name      = "${local.app_name}-model-agent"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "ome_controller_manager" {
  metadata {
    name      = "${local.app_name}-controller-manager"
    namespace = var.namespace
    labels    = local.labels
  }
}
