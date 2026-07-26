/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_daemonset" "prometheus_prometheus_node_exporter" {
  metadata {
    name      = "prometheus-prometheus-node-exporter"
    namespace = var.namespace

    labels = local.node_exporter_labels
  }

  spec {
    selector {
      match_labels = local.node_exporter_labels
    }

    template {
      metadata {
        labels = local.node_exporter_labels

        annotations = {
          "cluster-autoscaler.kubernetes.io/safe-to-evict" = "true"
        }
      }

      spec {
        volume {
          name = "proc"

          host_path {
            path = "/proc"
          }
        }

        volume {
          name = "sys"

          host_path {
            path = "/sys"
          }
        }

        volume {
          name = "root"

          host_path {
            path = "/"
          }
        }

        container {
          name  = "node-exporter"
          image = "quay.io/prom/node-exporter:v1.6.0"
          args  = ["--path.procfs=/host/proc", "--path.sysfs=/host/sys", "--path.rootfs=/host/root", "--path.udev.data=/host/root/run/udev/data", "--web.listen-address=[$(HOST_IP)]:9100"]

          port {
            name           = "metrics"
            container_port = 9100
            protocol       = "TCP"
          }

          env {
            name  = "HOST_IP"
            value = "0.0.0.0"
          }

          resources {
            limits = {
              cpu    = "200m"
              memory = "100Mi"
            }

            requests = {
              cpu    = "100m"
              memory = "50Mi"
            }
          }

          volume_mount {
            name       = "proc"
            read_only  = true
            mount_path = "/host/proc"
          }

          volume_mount {
            name       = "sys"
            read_only  = true
            mount_path = "/host/sys"
          }

          volume_mount {
            name              = "root"
            read_only         = true
            mount_path        = "/host/root"
            mount_propagation = "HostToContainer"
          }

          liveness_probe {
            http_get {
              path   = "/"
              port   = "metrics"
              scheme = "HTTP"
            }

            timeout_seconds   = 1
            period_seconds    = 10
            success_threshold = 1
            failure_threshold = 3
          }

          readiness_probe {
            http_get {
              path   = "/"
              port   = "metrics"
              scheme = "HTTP"
            }

            timeout_seconds   = 1
            period_seconds    = 10
            success_threshold = 1
            failure_threshold = 3
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              add  = ["SYS_TIME"]
              drop = ["ALL"]
            }

            read_only_root_filesystem = true
          }
        }

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = "prometheus-prometheus-node-exporter"
        host_network         = true
        host_pid             = true

        security_context {
          run_as_user     = 65534
          run_as_group    = 65534
          run_as_non_root = true
          fs_group        = 65534
        }

        affinity {
          node_affinity {
            required_during_scheduling_ignored_during_execution {
              node_selector_term {
                match_expressions {
                  key      = "eks.amazonaws.com/compute-type"
                  operator = "NotIn"
                  values   = ["fargate"]
                }

                match_expressions {
                  key      = "type"
                  operator = "NotIn"
                  values   = ["virtual-kubelet"]
                }
              }
            }
          }
        }

        toleration {
          operator = "Exists"
          effect   = "NoSchedule"
        }
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_unavailable = "1"
      }
    }

    revision_history_limit = 10
  }
}

