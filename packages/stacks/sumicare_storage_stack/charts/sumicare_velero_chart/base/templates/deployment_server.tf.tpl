/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "velero" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.server_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.server_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.server_labels
      }

      spec {
        service_account_name = kubernetes_service_account.velero_server.metadata[0].name

        container {
          name  = "velero"
          image = "${var.image}:v${var.velero_version}"

          {{ ContainerResources }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.server_labels" }}

        {{ TopologySpreadConstraint "local.server_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.server_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
