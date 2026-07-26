/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "tempo_query_frontend" {
  metadata {
    name      = "${local.app_name}-query-frontend"
    namespace = var.namespace
    labels    = local.query_frontend_labels
  }

  spec {
    replicas = var.query_frontend_replicas

    selector {
      match_labels = local.query_frontend_labels
    }

    template {
      metadata {
        labels = local.query_frontend_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.tempo_config.data["tempo.yaml"])
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = "${local.app_name}-config"

            items {
              key  = "tempo.yaml"
              path = "tempo.yaml"
            }
          }
        }

        volume {
          name = "runtime-config"

          config_map {
            name = "${local.app_name}-runtime"

            items {
              key  = "overrides.yaml"
              path = "overrides.yaml"
            }
          }
        }

        volume {
          name      = "tempo-queryfrontend-store"
          empty_dir = {}
        }

        container {
          name  = "query-frontend"
          image = "${var.image}:${var.tempo_version}"
          args  = ["-target=query-frontend", "-config.file=/conf/tempo.yaml", "-mem-ballast-size-mbs=1024"]

          port {
            name           = "http-metrics"
            container_port = 3200
          }

          port {
            name           = "grpc"
            container_port = 9095
          }

          {{ VolumeMount "config" "/conf" }}

          {{ VolumeMount "runtime-config" "/runtime-config" }}

          {{ VolumeMount "tempo-queryfrontend-store" "/var/tempo" }}

          {{ LivenessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.query_frontend_labels" }}

        {{ TopologySpreadConstraint "local.query_frontend_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}
      }
    }

    strategy {
      rolling_update {
        max_unavailable = "1"
      }
    }

    min_ready_seconds      = 10
    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
