/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "tempo_ingester" {
  metadata {
    name      = "${local.deployment_name}-ingester"
    namespace = var.namespace
    labels    = local.ingester_labels
  }

  spec {
    replicas = var.ingester_replicas

    selector {
      match_labels = local.ingester_labels
    }

    template {
      metadata {
        labels = local.ingester_labels
      }

      spec {
        service_account_name = kubernetes_service_account.release_name_tempo.metadata[0].name

        container {
          name  = "ingester"
          image = "${var.image}:${var.tempo_version}"
          args  = ["-target=ingester", "-config.file=/conf/tempo.yaml", "-config.expand-env=true"]

          {{ ContainerResources }}

          {{ LivenessProbe "/ready" "3200" "HTTP" }}

          {{ ReadinessProbe "/ready" "3200" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.ingester_labels" }}

        {{ TopologySpreadConstraint "local.ingester_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.ingester_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    service_name           = "${local.deployment_name}-ingester-headless"
    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
