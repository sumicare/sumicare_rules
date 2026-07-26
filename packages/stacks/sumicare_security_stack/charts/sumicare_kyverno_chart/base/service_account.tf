/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_service_account" "kyverno_admission_controller" {
  metadata {
    name      = "${local.app_name}-admission-controller"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kyverno_background_controller" {
  metadata {
    name      = "${local.app_name}-background-controller"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kyverno_cleanup_controller" {
  metadata {
    name      = "${local.app_name}-cleanup-controller"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kyverno_reports_controller" {
  metadata {
    name      = "${local.app_name}-reports-controller"
    namespace = var.namespace
    labels    = local.labels
  }
}

resource "kubernetes_service_account" "kyverno_migrate_resources" {
  metadata {
    name      = "${local.app_name}-migrate-resources"
    namespace = var.namespace
    labels    = local.labels
  }
}
