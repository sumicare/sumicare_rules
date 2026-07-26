/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "valkey_operator" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.operator_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.operator_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.operator_labels
      }

      spec {
        service_account_name = kubernetes_service_account.valkey_operator.metadata[0].name

        container {
          name  = "valkey-operator"
          image = "${var.image}:v${var.valkey_operator_version}"

          {{ ContainerResources }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}

        {{ NodeAffinityWithPodAntiAffinity "local.operator_labels" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
