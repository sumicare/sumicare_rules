/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "release_name_argo_rollouts" {
  metadata {
    name      = local.app_name
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
          "checksum/cm" = md5(kubernetes_config_map.argo_rollouts.data["trafficRouterPlugins"])
        }
      }

      spec {
        {{ VolumeEmptyDir "plugin-bin" }}

        {{ VolumeEmptyDir "tmp" }}

        container {
          name  = "argo-rollouts"
          image = "${var.image}:v${var.argo_rollouts_version}"
          args  = ["--healthzPort=8080", "--metricsport=8090", "--loglevel=info", "--logformat=text", "--kloglevel=0", "--leader-elect"]

          port {
            name           = "metrics"
            container_port = 8090
          }

          port {
            name           = "healthz"
            container_port = 8080
          }

          {{ VolumeMount "plugin-bin" "/home/argo-rollouts/plugin-bin" }}

          {{ VolumeMount "tmp" "/tmp" }}

          {{ LivenessProbe "/healthz" "8080" "HTTP" }}

          {{ ReadinessProbe "/metrics" "8090" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = kubernetes_service_account.argo_rollouts.metadata[0].name

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
