/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_stateful_set" "garage" {
  metadata {
    name      = local.app_name
    namespace = var.namespace
    labels    = local.server_labels
  }

  spec {
    replicas = var.replicas

    selector {
      match_labels = local.server_labels
    }

    template {
      metadata {
        labels = local.server_labels
      }

      spec {
        service_account_name = kubernetes_service_account.garage.metadata[0].name

        container {
          name  = "garage"
          image = "${var.image}:v${var.garage_version}"

          
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

          image_pull_policy = "IfNotPresent"

          
security_context {
	capabilities {
		drop = ["ALL"]
	}

	read_only_root_filesystem = true
}
        }

        
security_context {
	run_as_non_root = true
	run_as_user     = var.run_as_user
	run_as_group    = var.run_as_group
	fs_group        = var.fs_group
}
      }
    }

    service_name           = "${local.app_name}-headless"
    revision_history_limit = var.revision_history_limit
  }
}
