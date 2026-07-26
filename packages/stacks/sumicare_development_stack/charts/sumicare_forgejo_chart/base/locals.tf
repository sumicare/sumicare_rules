/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

locals {
  app_name = "forgejo"

  labels = {
    "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
    "app.kubernetes.io/managed-by" = "terraform"
    "app.kubernetes.io/name"       = local.app_name
    "app.kubernetes.io/part-of"    = local.app_name
    "app.kubernetes.io/version"    = var.forgejo_version
    "app.kubernetes.io/org"        = var.org
    "app.kubernetes.io/env"        = var.env
  }

  selector_labels = {
    "app.kubernetes.io/instance" = "${var.org}-${var.env}"
    "app.kubernetes.io/name"     = local.app_name
  }

  # Computed names
  service_account_name = "${var.org}-${var.env}-${local.app_name}"
  deployment_name      = "${var.org}-${var.env}-${local.app_name}"
  service_http_name    = "${var.org}-${var.env}-${local.app_name}-http"
  service_ssh_name     = "${var.org}-${var.env}-${local.app_name}-ssh"
  pvc_name             = "${var.org}-${var.env}-${local.app_name}-data"
}
