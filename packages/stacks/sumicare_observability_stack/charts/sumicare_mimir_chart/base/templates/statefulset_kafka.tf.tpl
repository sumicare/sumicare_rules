/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_stateful_set" "mimir_kafka" {
  metadata {
    name      = "${local.app_name}-kafka"
    namespace = var.namespace
    labels    = local.kafka_labels
  }

  spec {
    replicas = var.kafka_replicas

    selector {
      match_labels = local.kafka_labels
    }

    template {
      metadata {
        namespace = var.namespace
        labels    = local.kafka_labels

        annotations = {
          "checksum/config" = md5(kubernetes_config_map.mimir_config.data["mimir.yaml"])
        }
      }

      spec {
        {{ VolumeEmptyDir "kafka-config" }}

        {{ VolumeEmptyDir "tmp" }}

        container {
          name  = "kafka"
          image = "apache/kafka-native:4.1.0"

          port {
            name           = "kafka"
            container_port = 9092
            protocol       = "TCP"
          }

          port {
            name           = "controller"
            container_port = 9093
            protocol       = "TCP"
          }

          {{ EnvFromFieldRef "_POD_NAME" "metadata.name" }}

          env {
            name = "KAFKA_CLUSTER_ID"
          }

          env {
            name = "KAFKA_NODE_ID"

            value_from {
              field_ref {
                field_path = "metadata.labels['apps.kubernetes.io/pod-index']"
              }
            }
          }

          env {
            name  = "KAFKA_PROCESS_ROLES"
            value = "broker,controller"
          }

          env {
            name  = "KAFKA_LISTENERS"
            value = "PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093"
          }

          env {
            name  = "KAFKA_ADVERTISED_LISTENERS"
            value = "PLAINTEXT://$(_POD_NAME).${local.app_name}-kafka-headless.mimir.svc.cluster.local.:9092"
          }

          env {
            name  = "KAFKA_CONTROLLER_QUORUM_VOTERS"
            value = "0@${local.app_name}-kafka-0.${local.app_name}-kafka-headless.mimir.svc.cluster.local:9093"
          }

          env {
            name  = "KAFKA_CONTROLLER_LISTENER_NAMES"
            value = "CONTROLLER"
          }

          env {
            name  = "KAFKA_INTER_BROKER_LISTENER_NAME"
            value = "PLAINTEXT"
          }

          env {
            name  = "KAFKA_LOG_DIRS"
            value = "/var/lib/kafka/data"
          }

          env {
            name  = "KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR"
            value = "1"
          }

          env {
            name  = "KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR"
            value = "1"
          }

          env {
            name  = "KAFKA_TRANSACTION_STATE_LOG_MIN_ISR"
            value = "1"
          }

          env {
            name  = "KAFKA_LOG_RETENTION_HOURS"
            value = "24"
          }

          {{ ContainerResources }}

          {{ VolumeMount "kafka-data" "/var/lib/kafka" }}

          {{ VolumeMount "kafka-config" "/opt/kafka/config" }}

          {{ VolumeMount "tmp" "/tmp" }}

          readiness_probe {
            tcp_socket {
              port = "kafka"
            }

            initial_delay_seconds = 10
            timeout_seconds       = 5
            period_seconds        = 5
            failure_threshold     = 3
          }

          {{ ImagePullPolicyIfNotPresent }}

          {{ ContainerSecurityContext }}
        }

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        security_context {
          run_as_user     = 1001
          run_as_group    = 1001
          run_as_non_root = true
          fs_group        = 1001

          {{ SeccompProfileRuntimeDefault }}
        }
      }
    }

    volume_claim_template {
      metadata {
        name = "kafka-data"
      }

      spec {
        access_modes = ["ReadWriteOnce"]

        resources {
          requests = {
            storage = "5Gi"
          }
        }
      }
    }

    service_name = "${local.app_name}-kafka-headless"
  }

  {{ LifecycleIgnoreVPAChanges }}
}
