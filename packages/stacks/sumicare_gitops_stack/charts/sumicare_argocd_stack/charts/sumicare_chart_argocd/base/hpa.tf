/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_horizontal_pod_autoscaler" "release_name_argocd_repo_server" {
  metadata {
    name      = "release-name-argocd-repo-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "repo-server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-repo-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-argocd-repo-server"
      api_version = "apps/v1"
    }

    min_replicas = 1
    max_replicas = 5

    metric {
      type = "External"

      external {
        metric {
          name = "argocd_repo_pending_request_total"

          selector {
            match_labels = {
              "app.kubernetes.io/name" = "argocd-repo-server"
            }
          }
        }

        target {
          type = "AverageValue"
        }
      }
    }

    metric {
      type = "External"

      external {
        metric {
          name = "argocd_git_request_total"

          selector {
            match_labels = {
              "app.kubernetes.io/name" = "argocd-repo-server"
            }
          }
        }

        target {
          type = "AverageValue"
        }
      }
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler" "release_name_argocd_server" {
  metadata {
    name      = "release-name-argocd-server"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "server"
      "app.kubernetes.io/instance"   = "${var.org}-${var.env}"
      "app.kubernetes.io/name"       = "argocd-server"
      "app.kubernetes.io/part-of"    = "argocd"
      "app.kubernetes.io/version"    = "v3.1.8"
    }
  }

  spec {
    scale_target_ref {
      kind        = "Deployment"
      name        = "release-name-argocd-server"
      api_version = "apps/v1"
    }

    min_replicas = 1
    max_replicas = 5

    metric {
      type = "External"

      external {
        metric {
          name = "argocd_repo_pending_request_total"

          selector {
            match_labels = {
              "app.kubernetes.io/name" = "argocd-repo-server"
            }
          }
        }

        target {
          type = "AverageValue"
        }
      }
    }

    metric {
      type = "External"

      external {
        metric {
          name = "argocd_git_request_total"

          selector {
            match_labels = {
              "app.kubernetes.io/name" = "argocd-repo-server"
            }
          }
        }

        target {
          type = "AverageValue"
        }
      }
    }
  }
}
