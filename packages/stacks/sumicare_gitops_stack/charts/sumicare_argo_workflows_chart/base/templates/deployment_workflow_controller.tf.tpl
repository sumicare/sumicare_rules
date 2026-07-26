/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "release_name_argo_workflows_workflow_controller" {
  metadata {
    name      = "${local.app_name}-workflow-controller"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.controller_replicas

    selector {
      match_labels = local.controller_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.controller_labels
      }

      spec {
        container {
          name    = "controller"
          image   = "${var.controller_image}:v${var.argo_workflows_version}"
          command = ["workflow-controller"]
          args    = ["--configmap", "${local.app_name}-workflow-controller-configmap", "--executor-image", "${var.executor_image}:v${var.argo_workflows_version}", "--loglevel", "info", "--gloglevel", "0", "--log-format", "text", "--workflow-workers", "32", "--workflow-ttl-workers", "4", "--pod-cleanup-workers", "4", "--cron-workflow-workers", "8"]

          port {
            name           = "metrics"
            container_port = 9090
          }

          port {
            container_port = 6060
          }

          {{ EnvFromFieldRef "ARGO_NAMESPACE" "metadata.namespace" }}

          {{ EnvFromFieldRef "LEADER_ELECTION_IDENTITY" "metadata.name" }}

          env {
            name  = "LEADER_ELECTION_DISABLE"
            value = "true"
          }

          {{ LivenessProbe "/healthz" "6060" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = kubernetes_service_account.argo_workflows_workflow_controller.metadata[0].name

        {{ NodeAffinityWithPodAntiAffinity "local.controller_labels" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
