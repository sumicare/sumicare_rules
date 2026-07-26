/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "keda_operator_metrics_apiserver" {
  metadata {
    name      = "${local.app_name}-metrics-apiserver"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.metrics_server_replicas

    selector {
      match_labels = local.metrics_server_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels      = local.metrics_server_labels
        annotations = var.pod_annotations
      }

      spec {
        {{ VolumeSecret "certificates" "kedaorg-certs" }}

        container {
          name    = "keda-operator-metrics-apiserver"
          image   = "${var.metrics_server_image}:${var.keda_version}"
          command = ["/keda-adapter"]
          args    = ["--port=8080", "--secure-port=6443", "--logtostderr=true", "--stderrthreshold=ERROR", "--disable-compression=true", "--metrics-service-address=keda-operator.keda.svc.${var.cluster_domain}:9666", "--client-ca-file=/certs/ca.crt", "--tls-cert-file=/certs/tls.crt", "--tls-private-key-file=/certs/tls.key", "--cert-dir=/certs", "--v=0", "--zap-log-level=info", "--zap-encoder=console", "--zap-time-encoding=rfc3339"]

          port {
            name           = "https"
            container_port = 6443
            protocol       = "TCP"
          }

          port {
            name           = "metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          env {
            name = "WATCH_NAMESPACE"
          }

          {{ EnvFromFieldRef "POD_NAMESPACE" "metadata.namespace" }}

          env {
            name  = "KEDA_HTTP_DEFAULT_TIMEOUT"
            value = "3000"
          }

          env {
            name  = "KEDA_HTTP_MIN_TLS_VERSION"
            value = "TLS12"
          }

          {{ ContainerResources }}

          {{ VolumeMountReadOnly "certificates" "/certs" }}

          {{ LivenessProbe "/healthz" "6443" "HTTPS" }}

          {{ ReadinessProbe "/readyz" "6443" "HTTPS" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        dns_policy = "ClusterFirst"

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name            = kubernetes_service_account.keda_metrics_server.metadata[0].name
        automount_service_account_token = true

        {{ PodSecurityContext }}

        enable_service_links = true

        {{ NodeAffinityWithPodAntiAffinity "local.metrics_server_labels" }}

        {{ TopologySpreadConstraint "local.metrics_server_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.metrics_server_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
