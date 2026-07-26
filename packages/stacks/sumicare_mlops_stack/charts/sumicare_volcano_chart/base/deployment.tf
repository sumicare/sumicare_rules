/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "release_name_admission" {
  metadata {
    name      = "release-name-admission"
    namespace = var.namespace

    labels = {
      app = "volcano-admission"
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "volcano-admission"
      }
    }

    template {
      metadata {
        labels = {
          app = "volcano-admission"
        }

        annotations = {
          "rollme/helm-revision" = "1"
        }
      }

      spec {
        volume {
          name = "admission-certs"

          secret {
            secret_name  = "volcano-admission-secret"
            default_mode = "0644"
          }
        }

        volume {
          name = "admission-config"

          config_map {
            name = "release-name-admission-configmap"
          }
        }

        container {
          name  = "admission"
          image = "${var.webhook_image}:${var.volcano_version}"
          args  = ["--enabled-admission=/jobs/mutate,/jobs/validate,/podgroups/validate,/queues/mutate,/queues/validate,/hypernodes/validate,/cronjobs/validate", "--tls-cert-file=/admission.local.config/certificates/tls.crt", "--tls-private-key-file=/admission.local.config/certificates/tls.key", "--ca-cert-file=/admission.local.config/certificates/ca.crt", "--admission-conf=/admission.local.config/configmap/volcano-admission.conf", "--webhook-namespace=${var.namespace}", "--webhook-service-name=release-name-admission-service", "--enable-healthz=true", "--logtostderr", "--port=8443", "-v=4", "2>&1"]

          volume_mount {
            name       = "admission-certs"
            read_only  = true
            mount_path = "/admission.local.config/certificates"
          }

          volume_mount {
            name       = "admission-config"
            mount_path = "/admission.local.config/configmap"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              add  = ["DAC_OVERRIDE"]
              drop = ["ALL"]
            }

            run_as_user     = 1000
            run_as_non_root = true
          }
        }

        service_account = "release-name-admission"

        security_context {
          se_linux_option {
            level = "s0:c123,c456"
          }

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }

        priority_class_name = "system-cluster-critical"
      }
    }
  }
}

resource "kubernetes_deployment" "release_name_controllers" {
  metadata {
    name      = "release-name-controllers"
    namespace = var.namespace

    labels = {
      app = "volcano-controller"
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "volcano-controller"
      }
    }

    template {
      metadata {
        labels = {
          app = "volcano-controller"
        }
      }

      spec {
        container {
          name  = "release-name-controllers"
          image = "${var.image}:${var.volcano_version}"
          args  = ["--logtostderr", "--enable-healthz=true", "--enable-metrics=true", "--leader-elect=true", "--leader-elect-resource-namespace=${var.namespace}", "--kube-api-qps=50", "--kube-api-burst=100", "--worker-threads=3", "--worker-threads-for-gc=5", "--worker-threads-for-podgroup=5", "-v=4", "2>&1"]

          env {
            name  = "KUBE_POD_NAMESPACE"
            value = var.namespace
          }

          env {
            name  = "HELM_RELEASE_NAME"
            value = "release-name"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              add  = ["DAC_OVERRIDE"]
              drop = ["ALL"]
            }

            run_as_user     = 1000
            run_as_non_root = true
          }
        }

        service_account = "release-name-controllers"

        security_context {
          se_linux_option {
            level = "s0:c123,c456"
          }

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }

        priority_class_name = "system-cluster-critical"
      }
    }
  }
}

resource "kubernetes_deployment" "grafana" {
  metadata {
    name      = "grafana"
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "grafana"
      }
    }

    template {
      metadata {
        name = "grafana"

        labels = {
          app = "grafana"
        }
      }

      spec {
        volume {
          name      = "grafana-storage"
          empty_dir = {}
        }

        volume {
          name = "grafana-release-name-dashboard"

          config_map {
            name         = "grafana-release-name-dashboard"
            default_mode = "0644"
          }
        }

        volume {
          name = "grafana-datasources"

          config_map {
            name         = "grafana-datasources"
            default_mode = "0644"
          }
        }

        volume {
          name = "grafana-release-name-dashboard-config"

          config_map {
            name         = "grafana-release-name-dashboard-config"
            default_mode = "0644"
          }
        }

        container {
          name  = "grafana"
          image = "grafana/grafana:latest"

          port {
            name           = "grafana"
            container_port = 3000
          }

          resources {
            limits = {
              cpu    = "1"
              memory = "2Gi"
            }

            requests = {
              cpu    = "500m"
              memory = "1Gi"
            }
          }

          volume_mount {
            name       = "grafana-storage"
            mount_path = "/var/lib/grafana"
          }

          volume_mount {
            name       = "grafana-datasources"
            mount_path = "/etc/grafana/provisioning/datasources"
          }

          volume_mount {
            name       = "grafana-release-name-dashboard"
            mount_path = "/var/lib/grafana/dashboards"
          }

          volume_mount {
            name       = "grafana-release-name-dashboard-config"
            read_only  = true
            mount_path = "/etc/grafana/provisioning/dashboards"
          }

          liveness_probe {
            http_get {
              path = "/api/health"
              port = "3000"
            }

            initial_delay_seconds = 10
            period_seconds        = 10
          }

          readiness_probe {
            http_get {
              path = "/api/health"
              port = "3000"
            }
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "kube_state_metrics" {
  metadata {
    name      = "kube-state-metrics"
    namespace = var.namespace

    labels = {
      k8s-app = "kube-state-metrics"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        k8s-app = "kube-state-metrics"
      }
    }

    template {
      metadata {
        labels = {
          k8s-app = "kube-state-metrics"
        }
      }

      spec {
        container {
          name  = "kube-state-metrics"
          image = "${var.kube_state_metrics_image}:${var.kube_state_metrics_version}"

          port {
            name           = "http-metrics"
            container_port = 8080
          }

          readiness_probe {
            http_get {
              path = "/healthz"
              port = "8080"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 5
          }

          image_pull_policy = "IfNotPresent"
        }

        dns_policy           = "ClusterFirst"
        service_account_name = "kube-state-metrics"
      }
    }

    strategy {
      type = "RollingUpdate"

      rolling_update {
        max_unavailable = "25%"
        max_surge       = "25%"
      }
    }

    progress_deadline_seconds = 600
  }
}

resource "kubernetes_deployment" "prometheus_deployment" {
  metadata {
    name      = "prometheus-deployment"
    namespace = var.namespace

    labels = {
      app = "prometheus-server"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "prometheus-server"
      }
    }

    template {
      metadata {
        labels = {
          app = "prometheus-server"
        }
      }

      spec {
        volume {
          name = "prometheus-config-volume"

          config_map {
            name         = "prometheus-server-conf"
            default_mode = "0644"
          }
        }

        volume {
          name      = "prometheus-storage-volume"
          empty_dir = {}
        }

        container {
          name  = "prometheus"
          image = "prom/prometheus"
          args  = ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus/"]

          port {
            container_port = 9090
          }

          volume_mount {
            name       = "prometheus-config-volume"
            mount_path = "/etc/prometheus/"
          }

          volume_mount {
            name       = "prometheus-storage-volume"
            mount_path = "/prometheus/"
          }
        }
      }
    }
  }
}

resource "kubernetes_deployment" "release_name_scheduler" {
  metadata {
    name      = "release-name-scheduler"
    namespace = var.namespace

    labels = {
      app = "volcano-scheduler"
    }
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = {
        app = "volcano-scheduler"
      }
    }

    template {
      metadata {
        labels = {
          app = "volcano-scheduler"
        }
      }

      spec {
        volume {
          name = "scheduler-config"

          config_map {
            name = "release-name-scheduler-configmap"
          }
        }

        volume {
          name      = "klog-sock"
          empty_dir = {}
        }

        container {
          name  = "release-name-scheduler"
          image = "${var.scheduler_image}:${var.volcano_version}"
          args  = ["--logtostderr", "--scheduler-conf=/volcano.scheduler/volcano-scheduler.conf", "--enable-healthz=true", "--enable-metrics=true", "--leader-elect=true", "--leader-elect-resource-namespace=${var.namespace}", "--kube-api-qps=2000", "--kube-api-burst=2000", "--schedule-period=1s", "--node-worker-threads=20", "-v=3", "2>&1"]

          env {
            name  = "DEBUG_SOCKET_DIR"
            value = "/tmp/klog-socks"
          }

          volume_mount {
            name       = "scheduler-config"
            mount_path = "/volcano.scheduler"
          }

          volume_mount {
            name       = "klog-sock"
            mount_path = "/tmp/klog-socks"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              add  = ["DAC_OVERRIDE"]
              drop = ["ALL"]
            }

            run_as_user     = 1000
            run_as_non_root = true
          }
        }

        service_account = "release-name-scheduler"

        security_context {
          se_linux_option {
            level = "s0:c123,c456"
          }

          seccomp_profile {
            type = "RuntimeDefault"
          }
        }

        priority_class_name = "system-cluster-critical"
      }
    }
  }
}
