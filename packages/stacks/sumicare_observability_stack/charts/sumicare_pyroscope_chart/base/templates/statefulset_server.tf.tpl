/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "pyroscope" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.server_labels
    }

    template {
      metadata {
        labels = local.server_labels
        annotations = {
          "checksum/config" = md5(kubernetes_manifest.configmap_monitoring_pyroscope_config.manifest["data"]["config.yaml"])
        }
      }

      spec {
        {{ VolumeConfigMap "config" "pyroscope-config" }}

        {{ VolumeConfigMap "overrides-config" "pyroscope-overrides-config" }}

        {{ VolumeEmptyDir "data" }}

        container {
          name  = "pyroscope"
          image = "${var.image}:${var.pyroscope_version}"
          args = [
            "-target=all",
            "-self-profiling.disable-push=true",
            "-server.http-listen-port=4040",
            "-memberlist.cluster-label=${var.namespace}-pyroscope",
            "-memberlist.join=dns+${local.app_name}-memberlist.${var.namespace}.svc.cluster.local.:7946",
            "-config.file=/etc/pyroscope/config.yaml",
            "-runtime-config.file=/etc/pyroscope/overrides/overrides.yaml",
            "-log.level=debug",
          ]

          port {
            name           = "http2"
            container_port = 4040
            protocol       = "TCP"
          }

          port {
            name           = "memberlist"
            container_port = 7946
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "POD_NAME" "metadata.name" }}

          env {
            name  = "NAMESPACE_FQDN"
            value = "${var.namespace}.svc.cluster.local."
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/pyroscope/config.yaml"
            sub_path   = "config.yaml"
          }

          volume_mount {
            name       = "overrides-config"
            mount_path = "/etc/pyroscope/overrides/"
          }

          {{ VolumeMount "data" "/data" }}

          {{ ReadinessProbe "/ready" "http2" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        dns_policy           = "ClusterFirst"
        service_account_name = kubernetes_service_account.pyroscope.metadata[0].name

        {{ PodSecurityContext }}
      }
    }

    service_name          = "${local.app_name}-headless"
    pod_management_policy = "Parallel"
  }
}
