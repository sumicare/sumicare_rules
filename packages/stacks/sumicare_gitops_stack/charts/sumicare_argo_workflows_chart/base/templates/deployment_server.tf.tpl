/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "release_name_argo_workflows_server" {
  metadata {
    name      = "${local.app_name}-server"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.server_replicas

    selector {
      match_labels = local.server_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.server_labels

        annotations = {
          "checksum/cm" = md5(kubernetes_config_map.argo_workflows_controller_configmap.data["config"])
        }
      }

      spec {
        {{ VolumeEmptyDir "tmp" }}

        container {
          name  = "argo-server"
          image = "${var.server_image}:v${var.argo_workflows_version}"
          args  = ["server", "--configmap=${local.app_name}-workflow-controller-configmap", "--auth-mode=sso", "--auth-mode=client", "--secure=true", "--loglevel", "info", "--gloglevel", "0", "--log-format", "text"]

          port {
            name           = "web"
            container_port = 2746
          }

          env {
            name  = "IN_CLUSTER"
            value = "true"
          }

          {{ EnvFromFieldRef "ARGO_NAMESPACE" "metadata.namespace" }}

          env {
            name  = "ARGO_BASE_HREF"
            value = "/"
          }

          {{ VolumeMount "tmp" "/tmp" }}

          {{ ReadinessProbe "/" "2746" "HTTPS" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = kubernetes_service_account.argo_workflows_server.metadata[0].name

        {{ NodeAffinityWithPodAntiAffinity "local.server_labels" }}

        {{ TopologySpreadConstraint "local.server_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.server_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
