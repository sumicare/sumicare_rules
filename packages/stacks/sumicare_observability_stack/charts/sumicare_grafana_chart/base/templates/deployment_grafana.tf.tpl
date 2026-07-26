/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "grafana" {
  metadata {
    name      = local.deployment_name
    namespace = var.namespace
    labels    = local.selector_labels
  }

  spec {
    selector {
      match_labels = local.selector_labels
    }

    template {
      metadata {
        labels = local.selector_labels

        annotations = {
          "checksum/config"                         = "c5eaae11aac698b0a43a4362bbdc79a8df073893c0274037f872b75568f9fe07"
          "checksum/dashboards-json-config"         = "aea989c253e9bc7a5b90bf31698731ac344483fcaac0fd7a396dcacbd3a43347"
          "checksum/sc-dashboard-provider-config"   = "e70bf6a851099d385178a76de9757bb0bef8299da6d8443602590e44f05fdf24"
          "kubectl.kubernetes.io/default-container" = "${local.app_name}"
        }
      }

      spec {
        {{ VolumeConfigMap "config" "local.deployment_name" }}

        {{ VolumeSecret "config-secret" "${local.deployment_name}-config-secret" }}

        volume {
          name = "dashboards-default"

          config_map {
            name = "${local.deployment_name}-dashboards-default"
          }
        }

        volume {
          name = "storage"

          persistent_volume_claim {
            claim_name = local.deployment_name
          }
        }

        {{ VolumeSecret "secret-files" "grafana-secret-files" }}

        init_container {
          name    = "init-chown-data"
          image   = "docker.io/library/busybox:1.31.1"
          command = ["chown", "-R", "472:472", "/var/lib/grafana"]

          {{ VolumeMount "storage" "/var/lib/grafana" }}

          {{ ImagePullPolicyIfNotPresent }}

          security_context {
            capabilities {
              add  = ["CHOWN"]
              drop = ["ALL"]
            }

            run_as_user = 0

            {{ SeccompProfileRuntimeDefault }}
          }
        }

        init_container {
          name    = "download-dashboards"
          image   = "docker.io/curlimages/curl:8.9.1"
          command = ["/bin/sh"]
          args    = ["-c", "mkdir -p /var/lib/grafana/dashboards/default && /bin/sh -x /etc/grafana/download_dashboards.sh"]

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/download_dashboards.sh"
            sub_path   = "download_dashboards.sh"
          }

          {{ VolumeMount "storage" "/var/lib/grafana" }}

          {{ VolumeMountReadOnly "secret-files" "/etc/secrets" }}

          {{ ImagePullPolicyIfNotPresent }}

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            {{ SeccompProfileRuntimeDefault }}
          }
        }

        container {
          name  = local.app_name
          image = "${var.image}:${var.grafana_version}"

          port {
            name           = local.app_name
            container_port = 3000
            protocol       = "TCP"
          }

          port {
            name           = "gossip-tcp"
            container_port = 9094
            protocol       = "TCP"
          }

          port {
            name           = "gossip-udp"
            container_port = 9094
            protocol       = "UDP"
          }

          port {
            name           = "profiling"
            container_port = 6060
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "POD_IP" "status.podIP" }}

          {{ EnvFromSecretRef "GF_SECURITY_ADMIN_USER" "grafana-admin-secret" "admin-user" }}

          {{ EnvFromSecretRef "GF_SECURITY_ADMIN_PASSWORD" "grafana-admin-secret" "admin-password" }}

          env {
            name  = "GF_PATHS_DATA"
            value = "/var/lib/grafana/"
          }

          env {
            name  = "GF_PATHS_LOGS"
            value = "/var/log/grafana"
          }

          env {
            name  = "GF_PATHS_PLUGINS"
            value = "/var/lib/grafana/plugins"
          }

          env {
            name  = "GF_PATHS_PROVISIONING"
            value = "/etc/grafana/provisioning"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/grafana.ini"
            sub_path   = "grafana.ini"
          }

          {{ VolumeMount "storage" "/var/lib/grafana" }}

          volume_mount {
            name       = "dashboards-default"
            mount_path = "/var/lib/grafana/dashboards/default/some-dashboard.json"
            sub_path   = "some-dashboard.json"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/datasources/datasources.yaml"
            sub_path   = "datasources.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/notifiers/notifiers.yaml"
            sub_path   = "notifiers.yaml"
          }

          volume_mount {
            name       = "config-secret"
            mount_path = "/etc/grafana/provisioning/alerting/contactpoints.yaml"
            sub_path   = "contactpoints.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/alerting/mutetimes.yaml"
            sub_path   = "mutetimes.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/alerting/policies.yaml"
            sub_path   = "policies.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/alerting/rules.yaml"
            sub_path   = "rules.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/alerting/templates.yaml"
            sub_path   = "templates.yaml"
          }

          volume_mount {
            name       = "config"
            mount_path = "/etc/grafana/provisioning/dashboards/dashboardproviders.yaml"
            sub_path   = "dashboardproviders.yaml"
          }

          {{ VolumeMountReadOnly "secret-files" "/etc/secrets" }}

          {{ LivenessProbe "/api/health" "3000" "HTTP" }}

          {{ ReadinessProbe "/api/health" "3000" "HTTP" }}

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContextWithSeccomp }}
        }

        service_account_name            = local.deployment_name
        automount_service_account_token = true

        security_context {
          run_as_user     = 472
          run_as_group    = 472
          run_as_non_root = true
          fs_group        = 472
        }

        enable_service_links = true
      }
    }

    strategy {
      type = "RollingUpdate"
    }

    revision_history_limit = var.revision_history_limit
  }

  {{ LifecycleIgnoreVPAChanges }}
}
