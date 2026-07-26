/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "kubearmor_controller" {
  metadata {
    name      = "${local.app_name}-controller"
    namespace = var.namespace
    labels    = local.controller_labels
  }

  spec {
    replicas = 1

    selector {
      match_labels = local.controller_labels
    }

    strategy {
	type = "RollingUpdate"

	rolling_update {
		max_unavailable = "25%"
		max_surge       = "25%"
	}
}

    template {
      metadata {
        labels = local.controller_labels
      }

      spec {
        volume {
          name = "cert"

          secret {
            secret_name = "kubearmor-controller-webhook-server-cert"
          }
        }

        volume {
          name = "sys-path"

          host_path {
            path = "/sys/kernel/security"
            type = "Directory"
          }
        }

        container {
          name    = "manager"
          image   = "${var.image}:v${var.kubearmor_version}"
          command = ["/manager"]
          args    = ["--annotateExisting=false"]

          port {
            name           = "webhook-server"
            container_port = 9443
            protocol       = "TCP"
          }

          volume_mount {
            name       = "cert"
            read_only  = true
            mount_path = "/tmp/k8s-webhook-server/serving-certs"
          }

          volume_mount {
            name       = "sys-path"
            mount_path = "/sys/kernel/security"
          }

          
liveness_probe {
	http_get {
		path   = "/healthz"
		port   = "8081"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.liveness_probe_initial_delay
	timeout_seconds       = var.liveness_probe_timeout
	period_seconds        = var.liveness_probe_period
	success_threshold     = 1
	failure_threshold     = var.liveness_probe_failure_threshold
}

          
readiness_probe {
	http_get {
		path   = "/readyz"
		port   = "8081"
		scheme = "HTTP"
	}

	initial_delay_seconds = var.readiness_probe_initial_delay
	timeout_seconds       = var.readiness_probe_timeout
	period_seconds        = var.readiness_probe_period
	success_threshold     = 1
	failure_threshold     = var.readiness_probe_failure_threshold
}

          image_pull_policy = "IfNotPresent"

          
security_context {
	capabilities {
		drop = ["ALL"]
	}

	read_only_root_filesystem = true
}
        }

        termination_grace_period_seconds = 10
        service_account_name             = kubernetes_service_account.kubearmor_controller.metadata[0].name

        
security_context {
	run_as_non_root = true
	run_as_user     = var.run_as_user
	run_as_group    = var.run_as_group
	fs_group        = var.fs_group
}
      }
    }

    revision_history_limit = var.revision_history_limit
  }

  lifecycle {
    # This is managed by VPA recommender
    ignore_changes = [
      spec[0].template[0].spec[0].container[0].resources.requests,
      spec[0].template[0].spec[0].container[0].resources.limits,
    ]
  }
}
