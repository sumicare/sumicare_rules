/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "ome_controller_manager" {
  metadata {
    name      = "${local.app_name}-controller-manager"
    namespace = var.namespace
    labels    = local.labels

    annotations = {
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.controller_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = merge(local.controller_labels, {
          "logging-forward" = "enabled"
        })

        annotations = {
          "kubectl.kubernetes.io/default-container" = "manager"
          "prometheus.io/path"                      = "/metrics"
          "prometheus.io/port"                      = "8080"
          "prometheus.io/scrape"                    = "true"
        }
      }

      spec {
        {{ VolumeSecret "cert" "${local.app_name}-webhook-server-cert" }}

        container {
          name    = "manager"
          image   = "${var.image}:v${var.ome_version}"
          command = ["/manager"]
          args    = ["--metrics-bind-address=:8080", "--leader-elect", "--webhook", "--zap-encoder=console"]

          port {
            name           = "webhook-server"
            container_port = 9443
            protocol       = "TCP"
          }

          port {
            name           = "metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "POD_NAMESPACE" "metadata.namespace" }}

          env {
            name  = "SECRET_NAME"
            value = "${local.app_name}-webhook-server-cert"
          }

          {{ ContainerResources }}

          {{ VolumeMountReadOnly "cert" "/tmp/k8s-webhook-server/serving-certs" }}

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        termination_grace_period_seconds = 10
        service_account_name             = kubernetes_service_account.ome_controller_manager.metadata[0].name

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
