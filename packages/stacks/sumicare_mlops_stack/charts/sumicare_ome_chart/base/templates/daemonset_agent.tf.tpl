/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_daemonset" "ome_model_agent_daemonset" {
  metadata {
    name      = "${local.app_name}-model-agent-daemonset"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    selector {
      match_labels = {
        "app.kubernetes.io/component" = "${local.app_name}-model-agent-daemonset"
      }
    }

    template {
      metadata {
        labels = {
          "app.kubernetes.io/component" = "${local.app_name}-model-agent-daemonset"
          logging-forward               = "enabled"
        }

        annotations = {
          "prometheus.io/path"   = "/metrics"
          "prometheus.io/port"   = "8080"
          "prometheus.io/scrape" = "true"
        }
      }

      spec {
        volume {
          name = "host-models"

          host_path {
            path = "/mnt/data/models"
            type = "DirectoryOrCreate"
          }
        }

        container {
          name  = "model-agent"
          image = "${var.image}:v${var.ome_version}"
          args  = ["--models-root-dir", "/mnt/data/models", "--num-download-worker", "2"]

          port {
            name           = "metrics"
            container_port = 8080
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "NODE_NAME" "spec.nodeName" }}

          {{ ContainerResources }}

          volume_mount {
            name       = "host-models"
            mount_path = "/mnt/data/models"
          }

          {{ LivenessProbe "/livez" "8080" "HTTP" }}

          {{ ReadinessProbe "/healthz" "8080" "HTTP" }}

          image_pull_policy = "Always"
        }

        service_account_name = kubernetes_service_account.ome_model_agent.metadata[0].name

        {{ Toleration }}

        priority_class_name = "system-node-critical"
      }
    }

    strategy {
      type = "RollingUpdate"
    }
  }
}
