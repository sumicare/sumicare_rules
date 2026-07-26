/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "prometheus_alertmanager" {
  metadata {
    name        = "prometheus-alertmanager"
    namespace   = var.namespace
    labels      = local.alertmanager_labels
  }

  spec {
    replicas = var.alertmanager_replicas

    selector {
      match_labels = local.alertmanager_labels
    }

    template {
      metadata {
        labels = local.alertmanager_labels
        annotations = {
          "checksum/config" = md5(kubernetes_config_map.prometheus_alertmanager.data["alertmanager.yml"])
        }
      }

      spec {
        service_account_name = kubernetes_service_account.prometheus_alertmanager.metadata[0].name

        {{ VolumeConfigMap "config" "prometheus-alertmanager" }}

        container {
          name    = "alertmanager"
          image   = "${var.alertmanager_image}:v${var.alertmanager_version}"
          args    = ["--storage.path=/alertmanager", "--config.file=/etc/alertmanager/alertmanager.yml"]

          port {
            name           = "http"
            container_port = 9093
            protocol       = "TCP"
          }

          env {
            name = "POD_IP"

            value_from {
              field_ref {
                api_version = "v1"
                field_path  = "status.podIP"
              }
            }
          }

          {{ ContainerResources }}

          {{ VolumeMount "config" "/etc/alertmanager" }}

          {{ VolumeMount "storage" "/alertmanager" }}

          {{ LivenessProbe "/" "9093" "HTTP" }}

          {{ ReadinessProbe "/" "9093" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}
      }
    }

    volume_claim_template {
      metadata {
        name = "storage"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = var.alertmanager_storage_size
          }
        }
      }
    }

    service_name           = kubernetes_service.prometheus_alertmanager_headless.metadata[0].name
    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
