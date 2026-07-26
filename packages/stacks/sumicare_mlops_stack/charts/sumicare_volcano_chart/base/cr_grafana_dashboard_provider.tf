/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

# Grafana Dashboard Provider as Custom Resource
# This replaces the ConfigMap-based dashboard provisioning with Grafana Operator CR

resource "kubernetes_manifest" "grafana_dashboard_provider" {
  manifest = {
    apiVersion = "grafana.integreatly.org/v1beta1"
    kind       = "GrafanaDashboard"

    metadata = {
      name      = "volcano-dashboard-provider"
      namespace = var.namespace
      labels = {
        app       = "grafana"
        component = "dashboard-provider"
      }
    }

    spec = {
      instanceSelector = {
        matchLabels = {
          dashboards = "volcano"
        }
      }

      folder       = "Volcano"
      resyncPeriod = "30s"

      datasources = [
        {
          inputName      = "DS_PROMETHEUS"
          datasourceName = "Prometheus"
        }
      ]
    }
  }
}

# Individual dashboard CRs for each dashboard JSON
resource "kubernetes_manifest" "grafana_dashboard_global_overview" {
  manifest = {
    apiVersion = "grafana.integreatly.org/v1beta1"
    kind       = "GrafanaDashboard"

    metadata = {
      name      = "volcano-global-overview"
      namespace = var.namespace
      labels = {
        app       = "grafana"
        dashboard = "volcano"
      }
    }

    spec = {
      instanceSelector = {
        matchLabels = {
          dashboards = "volcano"
        }
      }

      folder = "Volcano"
      json   = file("${path.module}/conf/volcano-global-overview-dashboard.json")
    }
  }
}

resource "kubernetes_manifest" "grafana_dashboard_namespace_overview" {
  manifest = {
    apiVersion = "grafana.integreatly.org/v1beta1"
    kind       = "GrafanaDashboard"

    metadata = {
      name      = "volcano-namespace-overview"
      namespace = var.namespace
      labels = {
        app       = "grafana"
        dashboard = "volcano"
      }
    }

    spec = {
      instanceSelector = {
        matchLabels = {
          dashboards = "volcano"
        }
      }

      folder = "Volcano"
      json   = file("${path.module}/conf/volcano-namespace-overview-dashboard.json")
    }
  }
}

resource "kubernetes_manifest" "grafana_dashboard_queue_overview" {
  manifest = {
    apiVersion = "grafana.integreatly.org/v1beta1"
    kind       = "GrafanaDashboard"

    metadata = {
      name      = "volcano-queue-overview"
      namespace = var.namespace
      labels = {
        app       = "grafana"
        dashboard = "volcano"
      }
    }

    spec = {
      instanceSelector = {
        matchLabels = {
          dashboards = "volcano"
        }
      }

      folder = "Volcano"
      json   = file("${path.module}/conf/volcano-queue-overview-dashboard.json")
    }
  }
}
