/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_secret" "grafana_cloud" {
  metadata {
    name = "grafana-cloud"
  }

  data = {
    PROMETHEUS_HOST     = "https://prometheus-us-central1.grafana.net/api/prom/push"
    PROMETHEUS_USERNAME = "123456"
  }
}

