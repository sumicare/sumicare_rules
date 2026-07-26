/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_manifest" "configmap_monitoring_pyroscope_overrides_config" {
  manifest = {
    "apiVersion" = "v1"
    "data" = {
      "overrides.yaml" = <<-EOT
      overrides:
        {}

      EOT
    }
    "kind" = "ConfigMap"
    "metadata" = {
      "labels"    = local.labels
      "name"      = "${local.app_name}-overrides-config"
      "namespace" = var.namespace
    }
  }
}

resource "kubernetes_manifest" "configmap_monitoring_pyroscope_config" {
  manifest = {
    "apiVersion" = "v1"
    "data" = {
      "config.yaml" = <<-EOT
      {}

      EOT
    }
    "kind" = "ConfigMap"
    "metadata" = {
      "labels"    = local.labels
      "name"      = "${local.app_name}-config"
      "namespace" = var.namespace
    }
  }
}
