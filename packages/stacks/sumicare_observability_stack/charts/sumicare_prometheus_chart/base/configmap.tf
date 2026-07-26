resource "kubernetes_config_map" "prometheus_alertmanager" {
  metadata {
    name      = "prometheus-alertmanager"
    namespace = var.namespace

    labels = local.alertmanager_labels
  }

  data = {
    "alertmanager.yml" = file("./config/alertmanager.yml")
  }
}

resource "kubernetes_config_map" "prometheus_server" {
  metadata {
    name      = "prometheus-server"
    namespace = var.namespace

    labels = local.server_labels
  }

  data = {
    "alerting_rules.yml"  = file("./config/alerting_rules.yml")
    "alerts"              = file("./config/alerts.yml")
    "prometheus.yml"      = file("./config/prometheus.yml")
    "recording_rules.yml" = file("./config/recording_rules.yml")
    "rules"               = file("./config/rules.yml")

    "allow-snippet-annotations" = "false"

  }
}
