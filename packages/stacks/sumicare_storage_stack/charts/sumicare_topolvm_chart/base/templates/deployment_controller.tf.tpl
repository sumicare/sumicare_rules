/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "topolvm_controller" {
  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.controller_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.controller_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.controller_labels
      }

      spec {
        service_account_name = kubernetes_service_account.local_path_storage_local_path_provisioner.metadata[0].name

        container {
          name  = "topolvm-controller"
          image = "${var.image}:v${var.topolvm_version}"

          {{ ContainerResources }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.controller_labels" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
