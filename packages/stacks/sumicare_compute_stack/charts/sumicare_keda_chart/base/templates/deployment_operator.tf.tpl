/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "keda_operator" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.operator_replicas

    selector {
      match_labels = local.operator_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels      = local.operator_labels
        annotations = var.pod_annotations
      }

      spec {
        {{ VolumeSecret "certificates" "kedaorg-certs" }}

        container {
          name    = "keda-operator"
          image   = "${var.operator_image}:${var.keda_version}"
          command = ["/keda"]
          args    = ["--leader-elect", "--disable-compression=true", "--zap-log-level=info", "--zap-encoder=console", "--zap-time-encoding=rfc3339", "--enable-webhook-patching=true", "--cert-dir=/certs", "--enable-cert-rotation=true", "--cert-secret-name=kedaorg-certs", "--operator-service-name=keda-operator", "--metrics-server-service-name=keda-operator-metrics-apiserver", "--webhooks-service-name=keda-admission-webhooks", "--k8s-cluster-name=kubernetes-default", "--k8s-cluster-domain=${var.cluster_domain}", "--enable-prometheus-metrics=false"]

          port {
            name           = "metricsservice"
            container_port = 9666
            protocol       = "TCP"
          }

          env {
            name = "WATCH_NAMESPACE"
          }

          {{ EnvFromFieldRef "POD_NAME" "metadata.name" }}

          {{ EnvFromFieldRef "POD_NAMESPACE" "metadata.namespace" }}

          env {
            name  = "OPERATOR_NAME"
            value = local.app_name
          }

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

          {{ LivenessProbe "/healthz" "8081" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        dns_policy = "ClusterFirst"

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name            = kubernetes_service_account.keda_operator.metadata[0].name
        automount_service_account_token = true

        {{ PodSecurityContext }}

        enable_service_links = true

        {{ NodeAffinityWithPodAntiAffinity "local.operator_labels" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "topology.kubernetes.io/zone" "ScheduleAnyway" }}

        {{ TopologySpreadConstraint "local.operator_labels" 1 "kubernetes.io/hostname" "DoNotSchedule" }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
