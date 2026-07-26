/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

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
        volume {
          name = "kafka-config"

          empty_dir {}
        }

        volume {
          name = "tmp"

          empty_dir {}
        }

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

          env {
            name = "_POD_NAME"

            value_from {
              field_ref {
                field_path = "metadata.name"
              }
            }
          }

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

          
resources {
            limits = {
              cpu    = var.resources.limits.cpu
              memory = var.resources.limits.memory
            }

            requests = {
              cpu    = var.resources.requests.cpu
              memory = var.resources.requests.memory
            }
          }

          volume_mount {
            name       = "kafka-data"
            mount_path = "/var/lib/kafka"
          }

          volume_mount {
            name       = "kafka-config"
            mount_path = "/opt/kafka/config"
          }

          volume_mount {
            name       = "tmp"
            mount_path = "/tmp"
          }

          readiness_probe {
            tcp_socket {
              port = "kafka"
            }

            initial_delay_seconds = 10
            timeout_seconds       = 5
            period_seconds        = 5
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

        termination_grace_period_seconds = 30
        service_account_name             = local.app_name

        security_context {
          run_as_user     = 1001
          run_as_group    = 1001
          run_as_non_root = true
          fs_group        = 1001

          seccomp_profile {
              type = "RuntimeDefault"
            }
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

  lifecycle {
    # This is managed by VPA recommender
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].resources.requests,
      spec[0].template[0].spec[0].container[0].resources.limits,
    ]
  }
}
