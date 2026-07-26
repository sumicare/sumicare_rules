/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "release_name_argo_events_controller_manager" {
  metadata {
    name      = "${local.app_name}-controller-manager"
    namespace = var.namespace
    labels    = local.labels
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

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.argo_events_controller_manager.data["controller-manager-config.yaml"])
        }
      }

      spec {
        {{ VolumeConfigMap "config" "release-name-argo-events-controller-manager" }}

        container {
          name  = "controller-manager"
          image = "${var.image}:v${var.argo_events_version}"
          args  = ["controller"]

          port {
            name           = "metrics"
            container_port = 7777
            protocol       = "TCP"
          }

          port {
            name           = "probe"
            container_port = 8081
            protocol       = "TCP"
          }

          env {
            name  = "ARGO_EVENTS_IMAGE"
            value = "${var.image}:v${var.argo_events_version}"
          }

          {{ EnvFromFieldRef "NAMESPACE" "metadata.namespace" }}

          {{ VolumeMount "config" "/etc/argo-events" }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = kubernetes_service_account.argo_events_controller_manager.metadata[0].name

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
