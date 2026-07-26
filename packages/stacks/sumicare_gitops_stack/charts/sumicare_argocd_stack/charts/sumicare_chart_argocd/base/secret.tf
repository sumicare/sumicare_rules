/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "argocd_dex_server_tls" {
  metadata {
    name      = "argocd-dex-server-tls"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "dex-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-dex-server-tls"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  type = "kubernetes.io/tls"
}

resource "kubernetes_secret" "argocd_notifications_secret" {
  metadata {
    name      = "argocd-notifications-secret"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "notifications-controller"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-notifications-controller"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  type = "Opaque"
}

resource "kubernetes_secret" "argocd_repo_server_tls" {
  metadata {
    name      = "argocd-repo-server-tls"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "repo-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-repo-server-tls"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  type = "kubernetes.io/tls"
}

resource "kubernetes_secret" "argocd_secret" {
  metadata {
    name      = "argocd-secret"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-secret"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  type = "Opaque"
}

resource "kubernetes_secret" "argocd_repo_private_repo" {
  metadata {
    name      = "argocd-repo-private-repo"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance"     = "${var.org}-${var.env}"
      "app.kubernetes.io/managed-by"   = "Helm"
      "app.kubernetes.io/part-of"      = "argocd"
      "app.kubernetes.io/version"      = "v3.1.8"
      "argocd.argoproj.io/secret-type" = "repository"
    }
  }

  data = {
    url = "https://github.com/argoproj/private-repo"
  }
}

