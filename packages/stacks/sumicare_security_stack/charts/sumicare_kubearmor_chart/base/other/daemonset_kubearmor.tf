/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_daemonset" "kubearmor" {
  metadata {
    name      = "kubearmor"
    namespace = "kubearmor"

    labels = {
      kubearmor-app = "kubearmor"
    }
  }

  spec {
    selector {
      match_labels = {
        kubearmor-app = "kubearmor"
      }
    }

    template {
      metadata {
        labels = {
          kubearmor-app = "kubearmor"
        }

        annotations = {
          "container.apparmor.security.beta.kubernetes.io/kubearmor" = "unconfined"
        }
      }

      spec {
        volume {
          name      = "bpf"
          empty_dir = {}
        }

        volume {
          name = "usr-src-path"

          host_path {
            path = "/usr/src"
            type = "Directory"
          }
        }

        volume {
          name = "lib-modules-path"

          host_path {
            path = "/lib/modules"
            type = "DirectoryOrCreate"
          }
        }

        volume {
          name = "sys-kernel-security-path"

          host_path {
            path = "/sys/kernel/security"
            type = "Directory"
          }
        }

        volume {
          name = "sys-kernel-debug-path"

          host_path {
            path = "/sys/kernel/debug"
            type = "Directory"
          }
        }

        volume {
          name = "os-release-path"

          host_path {
            path = "/etc/os-release"
            type = "File"
          }
        }

        volume {
          name = "etc-apparmor-d-path"

          host_path {
            path = "/etc/apparmor.d"
            type = "DirectoryOrCreate"
          }
        }

        volume {
          name = "containerd-sock-path"

          host_path {
            path = "/var/run/containerd/containerd.sock"
            type = "Socket"
          }
        }

        init_container {
          name  = "init"
          image = "kubearmor/kubearmor-init:stable"

          volume_mount {
            name       = "bpf"
            mount_path = "/opt/kubearmor/BPF"
          }

          volume_mount {
            name       = "lib-modules-path"
            read_only  = true
            mount_path = "/lib/modules"
          }

          volume_mount {
            name       = "sys-kernel-security-path"
            mount_path = "/sys/kernel/security"
          }

          volume_mount {
            name       = "sys-kernel-debug-path"
            mount_path = "/sys/kernel/debug"
          }

          volume_mount {
            name       = "os-release-path"
            read_only  = true
            mount_path = "/media/root/etc/os-release"
          }

          volume_mount {
            name       = "usr-src-path"
            read_only  = true
            mount_path = "/usr/src"
          }

          image_pull_policy = "Always"

          security_context {
            capabilities {
              add  = ["SETUID", "SETGID", "SETPCAP", "SYS_ADMIN", "SYS_PTRACE", "MAC_ADMIN", "SYS_RESOURCE", "IPC_LOCK", "CAP_DAC_OVERRIDE", "CAP_DAC_READ_SEARCH"]
              drop = ["ALL"]
            }
          }
        }

        container {
          name  = "kubearmor"
          image = "kubearmor/kubearmor:stable"
          args  = ["-gRPC=32767", "--tlsEnabled=false"]

          port {
            container_port = 32767
          }

          env {
            name = "KUBEARMOR_NODENAME"

            value_from {
              field_ref {
                field_path = "spec.nodeName"
              }
            }
          }

          env {
            name = "KUBEARMOR_NAMESPACE"

            value_from {
              field_ref {
                field_path = "metadata.namespace"
              }
            }
          }

          resources {
            requests = {
              cpu    = "10m"
              memory = "64Mi"
            }
          }

          volume_mount {
            name       = "bpf"
            mount_path = "/opt/kubearmor/BPF"
          }

          volume_mount {
            name       = "usr-src-path"
            read_only  = true
            mount_path = "/usr/src"
          }

          volume_mount {
            name       = "lib-modules-path"
            read_only  = true
            mount_path = "/lib/modules"
          }

          volume_mount {
            name       = "sys-kernel-security-path"
            mount_path = "/sys/kernel/security"
          }

          volume_mount {
            name       = "sys-kernel-debug-path"
            mount_path = "/sys/kernel/debug"
          }

          volume_mount {
            name       = "os-release-path"
            read_only  = true
            mount_path = "/media/root/etc/os-release"
          }

          volume_mount {
            name       = "etc-apparmor-d-path"
            mount_path = "/etc/apparmor.d"
          }

          volume_mount {
            name       = "containerd-sock-path"
            read_only  = true
            mount_path = "/var/run/containerd/containerd.sock"
          }

          liveness_probe {
            exec {
              command = ["/bin/bash", "-c", "if [ -z $(pgrep kubearmor) ]; then exit 1; fi;"]
            }

            initial_delay_seconds = 60
            period_seconds        = 10
          }

          termination_message_path   = "/dev/termination-log"
          termination_message_policy = "File"
          image_pull_policy          = "Always"

          security_context {
            capabilities {
              add  = ["SETUID", "SETGID", "SETPCAP", "SYS_ADMIN", "SYS_PTRACE", "MAC_ADMIN", "SYS_RESOURCE", "IPC_LOCK", "CAP_DAC_OVERRIDE", "CAP_DAC_READ_SEARCH"]
              drop = ["ALL"]
            }
          }
        }

        restart_policy                   = "Always"
        termination_grace_period_seconds = 30
        dns_policy                       = "ClusterFirstWithHostNet"

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = "kubearmor"
        host_network         = true
        host_pid             = true
      }
    }
  }
}

