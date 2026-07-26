/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_deployment" "prometheus_kube_state_metrics" {
  metadata {
    name      = "prometheus-kube-state-metrics"
    namespace = var.namespace

    labels = local.kube_state_metrics_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.kube_state_metrics_labels
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_unavailable = "25%"
        max_surge       = "25%"
      }
    }

    template {
      metadata {
        labels = local.kube_state_metrics_labels
      }

      spec {
        service_account_name            = "prometheus-kube-state-metrics"
        automount_service_account_token = true

        container {
          name  = "kube-state-metrics"
          image = "registry.k8s.io/registry.k8s.io/kube-state-metrics/kube-state-metrics:v2.9.0"
          args  = ["--port=8080", "--resources=certificatesigningrequests,configmaps,cronjobs,daemonsets,deployments,endpointslices,horizontalpodautoscalers,ingresses,jobs,leases,limitranges,mutatingwebhookconfigurations,namespaces,networkpolicies,nodes,persistentvolumeclaims,persistentvolumes,poddisruptionbudgets,pods,replicasets,replicationcontrollers,resourcequotas,secrets,services,statefulsets,storageclasses,validatingwebhookconfigurations,volumeattachments"]

          port {
            name           = "http"
            container_port = 8080
          }

          port {
            name           = "metrics"
            container_port = 8081
          }

          resources {
            limits = {
              cpu    = "200m"
              memory = "200Mi"
            }

            requests = {
              cpu    = "100m"
              memory = "100Mi"
            }
          }

          liveness_probe {
            http_get {
              path   = "/livez"
              port   = "http"
              scheme = "HTTP"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 5
            period_seconds        = 10
            success_threshold     = 1
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path   = "/readyz"
              port   = "metrics"
              scheme = "HTTP"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 5
            period_seconds        = 10
            success_threshold     = 1
            failure_threshold     = 3
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            read_only_root_filesystem = true
          }
        }

        dns_policy = "ClusterFirst"

        security_context {
          run_as_user     = 65534
          run_as_group    = 65534
          run_as_non_root = true
          fs_group        = 65534

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }
      }
    }

    revision_history_limit = 10
  }
}
