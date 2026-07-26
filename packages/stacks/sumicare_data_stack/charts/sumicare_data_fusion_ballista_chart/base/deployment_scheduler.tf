/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_deployment" "ballista_scheduler" {
  metadata {
    name      = "${local.app_name}-scheduler"
    namespace = var.namespace
    labels    = local.labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.scheduler_labels
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
        labels = local.scheduler_labels
      }

      spec {
        volume {
          name = "data"

          host_path {
            path = "/mnt"
            type = "DirectoryOrCreate"
          }
        }

        container {
          name  = "${local.app_name}-scheduler"
          image = "${var.scheduler_image}:${var.ballista_version}"
          args  = ["--bind-port=50050"]

          port {
            name           = "flight"
            container_port = 50050
          }

          volume_mount {
            name       = "data"
            mount_path = "/mnt"
          }

          image_pull_policy = "IfNotPresent"

          
security_context {
	capabilities {
		drop = ["ALL"]
	}

	read_only_root_filesystem = true
}
        }

        service_account_name = kubernetes_service_account.ballista_scheduler.metadata[0].name

        
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
