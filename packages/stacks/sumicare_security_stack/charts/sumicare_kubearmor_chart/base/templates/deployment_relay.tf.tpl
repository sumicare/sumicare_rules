/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_deployment" "kubearmor_relay" {
  metadata {
    name      = "${local.app_name}-relay"
    namespace = var.namespace
    labels    = local.relay_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.relay_labels
    }

    {{ DeploymentRollingUpdate 25 }}

    template {
      metadata {
        labels = local.relay_labels
      }

      spec {
        container {
          name  = "kubearmor-relay-server"
          image = "kubearmor/kubearmor-relay-server:latest"
          args  = ["--tlsEnabled=false"]

          port {
            container_port = 32767
          }

          {{ ImagePullPolicyIfNotPresent }}
        }

        node_selector = {
          "kubernetes.io/os" = "linux"
        }

        service_account_name = kubernetes_service_account.kubearmor_relay.metadata[0].name
      }
    }

    revision_history_limit = var.revision_history_limit
  }
}
