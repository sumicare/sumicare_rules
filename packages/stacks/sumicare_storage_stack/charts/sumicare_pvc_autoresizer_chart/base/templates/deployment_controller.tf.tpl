/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "pvc_autoresizer_controller" {
  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.controller_labels
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
      }

      spec {
        {{ VolumeSecret "certs" "pvc-autoresizer-controller" }}

        container {
          name    = "pvc-autoresizer"
          image   = "${var.image}:${var.pvc_autoresizer_version}"
          command = ["/pvc-autoresizer"]
          args    = ["--prometheus-url=http://prometheus-prometheus-oper-prometheus.prometheus.svc:9090", "--interval=10s"]

          port {
            name           = "webhook"
            container_port = 9443
            protocol       = "TCP"
          }

          port {
            name           = "metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          port {
            name           = "health"
            container_port = 8081
            protocol       = "TCP"
          }

          {{ VolumeMountReadOnly "certs" "/certs" }}

          {{ LivenessProbe "/healthz" "health" "HTTP" }}

          {{ ReadinessProbe "/readyz" "health" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}
        }

        termination_grace_period_seconds = 10
        service_account_name             = kubernetes_service_account.pvc_autoresizer_controller.metadata[0].name

        {{ NodeAffinityWithPodAntiAffinity "local.controller_labels" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.controller_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
