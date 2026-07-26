/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "tekton_operator" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
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
        container {
          name  = "${local.app_name}-lifecycle"
          image = "${var.image}:v${var.tekton_operator_version}"
          args  = ["-controllers", "tektonconfig,tektonpipeline,tektontrigger,tektonhub,tektonchain,tektonresult,tektondashboard,manualapprovalgate,tektonpruner", "-unique-process-name", "${local.app_name}-lifecycle"]

          env {
            name  = "KUBERNETES_MIN_VERSION"
            value = "v1.0.0"
          }

          {{ EnvFromFieldRef "SYSTEM_NAMESPACE" "metadata.namespace" }}

          {{ EnvFromFieldRef "POD_NAME" "metadata.name" }}

          env {
            name  = "OPERATOR_NAME"
            value = local.app_name
          }

          env {
            name  = "IMAGE_PIPELINES_PROXY"
            value = var.proxy_webhook_image
          }

          env {
            name  = "IMAGE_JOB_PRUNER_TKN"
            value = var.job_pruner_image
          }

          env {
            name  = "METRICS_DOMAIN"
            value = "tekton.dev/operator"
          }

          env {
            name  = "VERSION"
            value = "v${var.tekton_operator_version}"
          }

          env {
            name  = "CONFIG_OBSERVABILITY_NAME"
            value = "tekton-config-observability"
          }

          env {
            name  = "CONFIG_LEADERELECTION_NAME"
            value = "${local.app_name}-controller-config-leader-election"
          }

          {{ EnvFromConfigMapRef "AUTOINSTALL_COMPONENTS" "tekton-config-defaults" "AUTOINSTALL_COMPONENTS" }}

          {{ EnvFromConfigMapRef "DEFAULT_TARGET_NAMESPACE" "tekton-config-defaults" "DEFAULT_TARGET_NAMESPACE" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        container {
          name  = "${local.app_name}-cluster-operations"
          image = "${var.image}:v${var.tekton_operator_version}@${var.operator_image_digest}"
          args  = ["-controllers", "tektoninstallerset", "-unique-process-name", "${local.app_name}-cluster-operations"]

          env {
            name  = "KUBERNETES_MIN_VERSION"
            value = "v1.0.0"
          }

          {{ EnvFromFieldRef "SYSTEM_NAMESPACE" "metadata.namespace" }}

          {{ EnvFromFieldRef "POD_NAME" "metadata.name" }}

          env {
            name  = "OPERATOR_NAME"
            value = local.app_name
          }

          env {
            name  = "METRICS_DOMAIN"
            value = "tekton.dev/operator"
          }

          env {
            name  = "VERSION"
            value = "v${var.tekton_operator_version}"
          }

          env {
            name  = "CONFIG_OBSERVABILITY_NAME"
            value = "tekton-config-observability"
          }

          env {
            name  = "CONFIG_LEADERELECTION_NAME"
            value = "${local.app_name}-controller-config-leader-election"
          }

          {{ EnvFromConfigMapRef "AUTOINSTALL_COMPONENTS" "tekton-config-defaults" "AUTOINSTALL_COMPONENTS" }}

          {{ EnvFromConfigMapRef "DEFAULT_TARGET_NAMESPACE" "tekton-config-defaults" "DEFAULT_TARGET_NAMESPACE" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        service_account_name = local.app_name

        {{ NodeAffinityWithPodAntiAffinity "local.operator_labels" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
