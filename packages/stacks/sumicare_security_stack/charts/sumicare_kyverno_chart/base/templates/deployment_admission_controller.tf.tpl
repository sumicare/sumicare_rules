/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "kyverno_admission_controller" {
  metadata {
    name      = "${local.app_name}-admission-controller"
    namespace = var.namespace
    labels    = local.admission_controller_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.admission_controller_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.admission_controller_labels
      }

      spec {
        service_account_name = kubernetes_service_account.kyverno_admission_controller.metadata[0].name

        container {
          name  = "kyverno-admission-controller"
          image = "${var.image}:${var.kyverno_version}"

          {{ ContainerResources }}

          {{ LivenessProbe "/health/liveness" "9443" "HTTPS" }}

          {{ ReadinessProbe "/health/readiness" "9443" "HTTPS" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.admission_controller_labels" }}

        {{ TopologySpreadConstraint "local.admission_controller_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.admission_controller_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
