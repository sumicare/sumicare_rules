resource "kubernetes_pod" "release_name_forgejo_test_connection" {
  metadata {
    name = "release-name-forgejo-test-connection"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      version                        = "14.0.2"
    }

    annotations = {
      "helm.sh/hook" = "test"
    }
  }

  spec {
    container {
      name    = "wget"
      image   = "busybox:latest"
      command = ["wget"]
      args    = ["release-name-forgejo-http:3000"]
    }

    restart_policy = "Never"
  }
}
