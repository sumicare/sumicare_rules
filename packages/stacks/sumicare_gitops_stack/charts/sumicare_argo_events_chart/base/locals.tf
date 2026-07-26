/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

locals {
  app_name        = "argo-events"
  deployment_name = "${var.org}-${var.env}-${local.app_name}"

  labels = {
    "app.kubernetes.io/instance" = "${var.org}-${var.env}"
    "app.kubernetes.io/part-of"  = local.app_name
    "app.kubernetes.io/version"  = var.argo_events_version
    "app.kubernetes.io/org"      = var.org
    "app.kubernetes.io/env"      = var.env
  }

  controller_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}"
    "app.kubernetes.io/component" = "controller"
  })

  webhook_labels = merge(local.labels, {
    "app.kubernetes.io/name"      = "${var.org}-${var.env}-${local.app_name}-events-webhook"
    "app.kubernetes.io/component" = "events-webhook"
  })
}
