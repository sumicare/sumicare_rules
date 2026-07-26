/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_config_map" "inferenceservice_config" {
  metadata {
    name      = "inferenceservice-config"
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    deploy            = jsonencode({ defaultDeploymentMode = "RawDeployment" })
    kedaConfig        = jsonencode({ enableKeda = true, promServerAddress = "http://prometheus-operated.monitoring.svc.${var.cluster_domain}:9090", customPromQuery = "", scalingThreshold = "10", scalingOperator = "GreaterThanOrEqual" })
    metricsAggregator = jsonencode({ enableMetricAggregation = "false", enablePrometheusScraping = "false" })
  }
}

resource "kubernetes_config_map" "benchmarkjob_config" {
  metadata {
    name      = "benchmarkjob-config"
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    benchmarkjob = jsonencode({ podConfig = { image = "${var.image}:v${var.ome_version}", cpuRequest = "2", memoryRequest = "2Gi", cpuLimit = "2", memoryLimit = "2Gi" } })
  }
}
