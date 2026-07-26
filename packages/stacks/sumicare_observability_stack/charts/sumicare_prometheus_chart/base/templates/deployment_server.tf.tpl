/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "prometheus_server" {
  metadata {
    name        = "prometheus-server"
    namespace   = var.namespace
    labels      = local.server_labels
  }

  spec {
    replicas = var.server_replicas

    selector {
      match_labels = local.server_labels
    }

    {{ DeploymentRecreate }}

    template {
      metadata {
        labels = local.server_labels
        annotations = {
          "checksum/config" = md5(kubernetes_config_map.prometheus_server.data["prometheus.yml"])
        }
      }

      spec {
        service_account_name = kubernetes_service_account.prometheus_server.metadata[0].name

        {{ VolumeConfigMap "config-volume" "prometheus-server" }}

        {{ VolumePersistentVolumeClaim "storage-volume" "prometheus-server" }}

        container {
          name    = "prometheus-server-configmap-reload"
          image   = "${var.config_reloader_image}:v${var.config_reloader_version}"
          args    = ["--watched-dir=/etc/config", "--listen-address=0.0.0.0:8080", "--reload-url=http://127.0.0.1:9090/-/reload"]

          port {
            name           = "metrics"
            container_port = 8080
          }

          {{ VolumeMountReadOnly "config-volume" "/etc/config" }}

          {{ LivenessProbe "/healthz" "8080" "HTTP" }}

          {{ ReadinessProbe "/healthz" "8080" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        container {
          name    = "prometheus-server"
          image   = "${var.server_image}:v${var.server_version}"
          args    = ["--storage.tsdb.retention.time=${var.storage_retention_time}", "--config.file=/etc/config/prometheus.yml", "--storage.tsdb.path=/data", "--web.console.libraries=/etc/prometheus/console_libraries", "--web.console.templates=/etc/prometheus/consoles", "--web.enable-lifecycle"]

          port {
            container_port = 9090
          }

          {{ ContainerResources }}

          {{ VolumeMount "config-volume" "/etc/config" }}

          {{ VolumeMount "storage-volume" "/data" }}

          {{ LivenessProbe "/-/healthy" "9090" "HTTP" }}

          {{ ReadinessProbe "/-/ready" "9090" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 300

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
