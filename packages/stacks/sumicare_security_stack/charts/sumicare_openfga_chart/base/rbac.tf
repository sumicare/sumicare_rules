/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_role" "openfga_job_status_reader" {
  metadata {
    name = "openfga-job-status-reader"

    labels = {
      "app.kubernetes.io/component"  = "authorization-controller"
      "app.kubernetes.io/instance"   = "openfga"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "openfga"
      "app.kubernetes.io/part-of"    = "openfga"
      "app.kubernetes.io/version"    = "v1.11.6"
      "helm.sh/chart"                = "openfga-0.2.55"
    }
  }

  rule {
    verbs      = ["get", "list"]
    api_groups = ["batch"]
    resources  = ["jobs"]
  }
}

resource "kubernetes_role_binding" "openfga_job_status_reader" {
  metadata {
    name = "openfga-job-status-reader"

    labels = {
      "app.kubernetes.io/component"  = "authorization-controller"
      "app.kubernetes.io/instance"   = "openfga"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "openfga"
      "app.kubernetes.io/part-of"    = "openfga"
      "app.kubernetes.io/version"    = "v1.11.6"
      "helm.sh/chart"                = "openfga-0.2.55"
    }
  }

  subject {
    kind = "ServiceAccount"
    name = "openfga"
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "openfga-job-status-reader"
  }
}

