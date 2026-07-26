/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_service_account" "argocd_application_controller" {
  metadata {
    name      = "argocd-application-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "application-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-application-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "argocd_applicationset_controller" {
  metadata {
    name      = "argocd-applicationset-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "applicationset-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-applicationset-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "argocd_notifications_controller" {
  metadata {
    name      = "argocd-notifications-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "release_name_argocd_repo_server" {
  metadata {
    name      = "release-name-argocd-repo-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "repo-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-repo-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "argocd_server" {
  metadata {
    name      = "argocd-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

resource "kubernetes_service_account" "argocd_dex_server" {
  metadata {
    name      = "argocd-dex-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "dex-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-dex-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  automount_service_account_token = true
}

