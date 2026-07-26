/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "kubearmor" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kubearmor_controller" {
  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kubearmor_relay" {
  metadata {
    name      = "${local.app_name}-relay"
    namespace = var.namespace
    labels    = local.labels
  }
}
