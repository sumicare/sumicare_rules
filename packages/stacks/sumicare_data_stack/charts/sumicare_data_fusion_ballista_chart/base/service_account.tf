/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "ballista_scheduler" {
  metadata {
    name      = "${local.app_name}-scheduler"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "ballista_executor" {
  metadata {
    name      = "${local.app_name}-executor"
    namespace = var.namespace
    labels    = local.labels
  }
}
