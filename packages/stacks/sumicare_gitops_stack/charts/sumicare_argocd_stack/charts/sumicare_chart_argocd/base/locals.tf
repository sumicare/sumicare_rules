/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

locals {
  app_name = "argocd"

  labels = {
    "app.kubernetes.io/instance" = "${var.org}-${var.env}"
    "app.kubernetes.io/part-of"  = local.app_name
    "app.kubernetes.io/version"  = var.argocd_version
    "app.kubernetes.io/org"      = var.org
    "app.kubernetes.io/env"      = var.env
  }

  application_controller_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-application-controller"
    "app.kubernetes.io/component" = "application-controller"
  })

  applicationset_controller_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-applicationset-controller"
    "app.kubernetes.io/component" = "applicationset-controller"
  })

  notifications_controller_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-notifications-controller"
    "app.kubernetes.io/component" = "notifications-controller"
  })

  repo_server_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-repo-server"
    "app.kubernetes.io/component" = "repo-server"
  })

  server_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-server"
    "app.kubernetes.io/component" = "server"
  })

  dex_server_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-dex-server"
    "app.kubernetes.io/component" = "dex-server"
  })
}
