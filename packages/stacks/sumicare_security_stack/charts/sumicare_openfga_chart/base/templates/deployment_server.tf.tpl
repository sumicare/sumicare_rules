/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "openfga" {
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
        container {
          name  = "openfga"
          image = "${var.image}:v${var.openfga_version}"
          args  = ["run"]

          port {
            name           = "grpc"
            container_port = 8081
          }

          port {
            name           = "http"
            container_port = 8080
            protocol       = "TCP"
          }

          port {
            name           = "metrics"
            container_port = 2112
            protocol       = "TCP"
          }

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/healthz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        service_account_name = kubernetes_service_account.openfga.metadata[0].name

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
