/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "prometheus_kube_state_metrics" {
  metadata {
    name        = "prometheus-kube-state-metrics"
    namespace   = var.namespace
    labels      = local.kube_state_metrics_labels
  }

  spec {
    replicas = var.kube_state_metrics_replicas

    selector {
      match_labels = local.kube_state_metrics_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.kube_state_metrics_labels
      }

      spec {
        service_account_name = kubernetes_service_account.prometheus_kube_state_metrics.metadata[0].name

        container {
          name    = "kube-state-metrics"
          image   = "${var.kube_state_metrics_image}:v${var.kube_state_metrics_version}"
          args    = ["--port=8080", "--resources=certificatesigningrequests,configmaps,cronjobs,daemonsets,deployments,endpointslices,horizontalpodautoscalers,ingresses,jobs,leases,limitranges,mutatingwebhookconfigurations,namespaces,networkpolicies,nodes,persistentvolumeclaims,persistentvolumes,poddisruptionbudgets,pods,replicasets,replicationcontrollers,resourcequotas,secrets,services,statefulsets,storageclasses,validatingwebhookconfigurations,volumeattachments"]

          port {
            name           = "http"
            container_port = 8080
          }

          port {
            name           = "metrics"
            container_port = 8081
          }

          {{ ContainerResources }}

          {{ LivenessProbe "/livez" "8080" "HTTP" }}

          {{ ReadinessProbe "/readyz" "8081" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        {{ PodSecurityContext }}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
