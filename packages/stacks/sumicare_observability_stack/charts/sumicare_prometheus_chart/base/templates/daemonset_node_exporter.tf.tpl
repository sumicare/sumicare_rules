/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_daemonset" "prometheus_prometheus_node_exporter" {
  metadata {
    name        = "prometheus-prometheus-node-exporter"
    namespace   = var.namespace
    labels      = local.node_exporter_labels
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
        service_account_name = kubernetes_service_account.prometheus_prometheus_node_exporter.metadata[0].name
        host_network         = true
        host_pid             = true

        {{ VolumeHostPath "proc" "/proc" }}

        {{ VolumeHostPath "sys" "/sys" }}

        {{ VolumeHostPath "root" "/" }}

        container {
          name    = "node-exporter"
          image   = "${var.node_exporter_image}:v${var.node_exporter_version}"
          args    = ["--path.procfs=/host/proc", "--path.sysfs=/host/sys", "--path.rootfs=/host/root", "--path.udev.data=/host/root/run/udev/data", "--web.listen-address=[$(HOST_IP)]:9100"]

          port {
            name           = "metrics"
            container_port = 9100
            protocol       = "TCP"
          }

          env {
            name  = "HOST_IP"
            value = "0.0.0.0"
          }

          {{ ContainerResources }}

          {{ VolumeMountReadOnly "proc" "/host/proc" }}

          {{ VolumeMountReadOnly "sys" "/host/sys" }}

          {{ VolumeMountHostToContainer "root" "/host/root" }}

          {{ LivenessProbe "/" "9100" "HTTP" }}

          {{ ReadinessProbe "/" "9100" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

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

        {{ PodSecurityContext }}

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

    {{ DaemonSetRollingUpdate "1" }}

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
