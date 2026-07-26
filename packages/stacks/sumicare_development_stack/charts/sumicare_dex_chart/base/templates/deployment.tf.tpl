/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "dex" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.selector_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.selector_labels
      }

      spec {
        {{ VolumeSecret "config" "${local.app_name}-config" }}

        container {
          name  = "dex"
          image = "${var.image}:${var.dex_version}"
          args  = ["dex", "serve", "--web-http-addr", "0.0.0.0:5556", "--grpc-addr", "0.0.0.0:5557", "--telemetry-addr", "0.0.0.0:5558", "/etc/dex/cfg/config.yaml"]

          {{ EnvFromFieldRef "KUBERNETES_POD_NAMESPACE" "metadata.namespace" }}

          port {
            name           = "http"
            container_port = 5556
            protocol       = "TCP"
          }

          port {
            name           = "grpc"
            container_port = 5557
            protocol       = "TCP"
          }

          port {
            name           = "telemetry"
            container_port = 5558
            protocol       = "TCP"
          }

          {{ VolumeMountReadOnly "config" "/etc/dex/cfg" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        service_account_name = local.app_name

        {{ NodeAffinityWithPodAntiAffinity "local.selector_labels" }}

        {{ TopologySpreadConstraint "local.selector_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.selector_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
