/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.selector_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.selector_labels

        annotations = {
          "checksum/config" = sha256(var.config_secret_data)
        }
      }

      spec {
        {{ VolumeSecret "config" "${local.app_name}" }}

        container {
          name  = local.app_name
          image = "${var.image}:v${var.dex_version}"
          args = [
            "dex",
            "serve",
            "--web-http-addr",
            "0.0.0.0:${var.http_port}",
            "--telemetry-addr",
            "0.0.0.0:${var.telemetry_port}",
            "/etc/dex/config.yaml"
          ]

          port {
            name           = "http"
            container_port = var.http_port
            protocol       = "TCP"
          }

          port {
            name           = "telemetry"
            container_port = var.telemetry_port
            protocol       = "TCP"
          }

          {{ VolumeMountReadOnly "config" "/etc/dex" }}

          {{ LivenessProbe "/healthz/live" "telemetry" "HTTP" }}

          {{ ReadinessProbe "/healthz/ready" "telemetry" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        service_account_name = local.app_name

        {{ NodeAffinityWithPodAntiAffinity "local.selector_labels" }}

        {{ TopologySpreadConstraint "local.selector_labels" 1 "topology.kubernetes.io/zone" "DoNotSchedule" }}

        {{ TopologySpreadConstraint "local.selector_labels" 1 "kubernetes.io/hostname" "ScheduleAnyway" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
