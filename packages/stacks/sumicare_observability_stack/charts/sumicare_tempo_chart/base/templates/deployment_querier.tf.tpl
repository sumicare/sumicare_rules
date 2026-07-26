/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "tempo_querier" {
  metadata {
    name      = "${local.app_name}-querier"
    namespace = var.namespace
    labels    = local.querier_labels
  }

  spec {
    replicas = var.querier_replicas

    selector {
      match_labels = local.querier_labels
    }

    template {
      metadata {
        labels = local.querier_labels

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
          name      = "tempo-querier-store"
          empty_dir = {}
        }

        container {
          name  = "querier"
          image = "${var.image}:${var.tempo_version}"
          args  = ["-target=querier", "-config.file=/conf/tempo.yaml", "-mem-ballast-size-mbs=1024"]

          port {
            name           = "http-memberlist"
            container_port = 7946
            protocol       = "TCP"
          }

          port {
            name           = "http-metrics"
            container_port = 3200
          }

          {{ VolumeMount "config" "/conf" }}

          {{ VolumeMount "runtime-config" "/runtime-config" }}

          {{ VolumeMount "tempo-querier-store" "/var/tempo" }}

          {{ LivenessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ReadinessProbe "/ready" "http-metrics" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.querier_labels" }}

        {{ TopologySpreadConstraint "local.querier_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}
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
