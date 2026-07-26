/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_service_account" "release_name_admission" {
  metadata {
    name      = "release-name-admission"
    namespace = var.namespace
  }
}

resource "kubernetes_service_account" "release_name_agent" {
  metadata {
    name      = "release-name-agent"
    namespace = var.namespace

    labels = {
      app = "volcano-agent"
    }
  }
}

resource "kubernetes_service_account" "release_name_controllers" {
  metadata {
    name      = "release-name-controllers"
    namespace = var.namespace
  }
}

resource "kubernetes_service_account" "kube_state_metrics" {
  metadata {
    name      = "kube-state-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/name" = "kube-state-metrics"
    }
  }
}

resource "kubernetes_service_account" "release_name_scheduler" {
  metadata {
    name      = "release-name-scheduler"
    namespace = var.namespace
  }
}

resource "kubernetes_service_account" "release_name_admission_init" {
  metadata {
    name      = "release-name-admission-init"
    namespace = var.namespace

    annotations = {
      "helm.sh/hook"               = "pre-install,pre-upgrade"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded"
      "helm.sh/hook-weight"        = "0"
    }
  }
}
