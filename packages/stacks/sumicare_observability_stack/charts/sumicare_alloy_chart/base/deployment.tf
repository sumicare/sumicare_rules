/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_deployment" "alloy" {
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

    template {
      metadata {
        labels = local.selector_labels

        annotations = {
          "kubectl.kubernetes.io/default-container" = "alloy"
        }
      }

      spec {
        volume {
          name = "config"

          config_map {
            name = local.app_name
          }
        }

        container {
          name  = "alloy"
          image = "${var.image}:v${var.alloy_version}"
          args  = ["run", "/etc/alloy/config.alloy", "--storage.path=/tmp/alloy", "--server.http.listen-addr=0.0.0.0:12345", "--server.http.ui-path-prefix=/", "--cluster.enabled=true", "--cluster.join-addresses=release-name-alloy-cluster", "--stability.level=generally-available"]

          port {
            name           = "http-metrics"
            container_port = 12345
          }

          env {
            name  = "ALLOY_DEPLOY_MODE"
            value = "helm"
          }

          env {
            name = "HOSTNAME"

            value_from {
              field_ref {
                field_path = "spec.nodeName"
              }
            }
          }

          resources {
            limits = {
              cpu    = "100m"
              memory = "128Mi"
            }

            requests = {
              cpu    = "10m"
              memory = "50Mi"
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/alloy"
          }

          readiness_probe {
            http_get {
              path   = "/-/ready"
              port   = "12345"
              scheme = "HTTP"
            }

            initial_delay_seconds = 10
            timeout_seconds       = 1
          }

          image_pull_policy = "IfNotPresent"
        }

        container {
          name  = "config-reloader"
          image = "quay.io/prometheus-operator/prometheus-config-reloader:v0.81.0"
          args  = ["--watched-dir=/etc/alloy", "--reload-url=http://localhost:12345/-/reload"]

          resources {
            requests = {
              cpu    = "10m"
              memory = "50Mi"
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/alloy"
          }
        }

        dns_policy           = "ClusterFirst"
        service_account_name = local.app_name
      }
    }

    min_ready_seconds = 10
  }
}

