/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_cluster_role" "kyverno_admission_controller" {
  metadata {
    name = "kyverno:admission-controller"

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  aggregation_rule {
    cluster_role_selectors {
      match_labels = {
        "rbac.kyverno.io/aggregate-to-admission-controller" = "true"
      }
    }

    cluster_role_selectors {
      match_labels = {
        "app.kubernetes.io/component" = "admission-controller"
        "app.kubernetes.io/instance"  = "kyverno"
        "app.kubernetes.io/part-of"   = "kyverno"
      }
    }
  }
}

resource "kubernetes_cluster_role" "kyverno_admission_controller_core" {
  metadata {
    name = "kyverno:admission-controller:core"

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["get"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["admissionregistration.k8s.io"]
    resources  = ["mutatingwebhookconfigurations", "validatingwebhookconfigurations", "validatingadmissionpolicies", "validatingadmissionpolicybindings", "mutatingadmissionpolicies", "mutatingadmissionpolicybindings"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["rbac.authorization.k8s.io"]
    resources  = ["roles", "clusterroles", "rolebindings", "clusterrolebindings"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["kyverno.io"]
    resources  = ["policies", "policies/status", "clusterpolicies", "clusterpolicies/status", "updaterequests", "updaterequests/status", "globalcontextentries", "globalcontextentries/status"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "update", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["policyexceptions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["validatingpolicies", "validatingpolicies/status", "namespacedvalidatingpolicies", "namespacedvalidatingpolicies/status", "imagevalidatingpolicies", "imagevalidatingpolicies/status", "namespacedimagevalidatingpolicies", "namespacedimagevalidatingpolicies/status", "generatingpolicies", "generatingpolicies/status", "namespacedgeneratingpolicies", "namespacedgeneratingpolicies/status", "mutatingpolicies", "mutatingpolicies/status", "namespacedmutatingpolicies", "namespacedmutatingpolicies/status"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "update", "watch"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["policyexceptions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["reports.kyverno.io"]
    resources  = ["ephemeralreports", "clusterephemeralreports"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["wgpolicyk8s.io"]
    resources  = ["policyreports", "policyreports/status", "clusterpolicyreports", "clusterpolicyreports/status"]
  }

  rule {
    verbs      = ["create", "update", "patch"]
    api_groups = ["", "events.k8s.io"]
    resources  = ["events"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authorization.k8s.io"]
    resources  = ["subjectaccessreviews"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "namespaces"]
  }

  rule {
    verbs      = ["create", "update", "patch", "get", "list", "watch"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }
}

resource "kubernetes_cluster_role" "kyverno_background_controller" {
  metadata {
    name = "kyverno:background-controller"

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  aggregation_rule {
    cluster_role_selectors {
      match_labels = {
        "rbac.kyverno.io/aggregate-to-background-controller" = "true"
      }
    }

    cluster_role_selectors {
      match_labels = {
        "app.kubernetes.io/component" = "background-controller"
        "app.kubernetes.io/instance"  = "kyverno"
        "app.kubernetes.io/part-of"   = "kyverno"
      }
    }
  }
}

resource "kubernetes_cluster_role" "kyverno_background_controller_core" {
  metadata {
    name = "kyverno:background-controller:core"

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["get"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["kyverno.io"]
    resources  = ["policies", "policies/status", "clusterpolicies", "clusterpolicies/status", "policyexceptions", "updaterequests", "updaterequests/status", "globalcontextentries", "globalcontextentries/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["generatingpolicies", "namespacedgeneratingpolicies", "mutatingpolicies", "namespacedmutatingpolicies", "policyexceptions"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "update", "watch"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["policyexceptions"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["namespaces", "configmaps"]
  }

  rule {
    verbs      = ["create", "get", "list", "patch", "update", "watch"]
    api_groups = ["", "events.k8s.io"]
    resources  = ["events"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["reports.kyverno.io"]
    resources  = ["ephemeralreports", "clusterephemeralreports"]
  }

  rule {
    verbs      = ["create", "update", "patch", "delete"]
    api_groups = ["networking.k8s.io"]
    resources  = ["ingresses", "ingressclasses", "networkpolicies"]
  }

  rule {
    verbs      = ["create", "update", "patch", "delete"]
    api_groups = ["rbac.authorization.k8s.io"]
    resources  = ["rolebindings", "roles"]
  }

  rule {
    verbs      = ["create", "update", "patch", "delete"]
    api_groups = [""]
    resources  = ["configmaps", "resourcequotas", "limitranges"]
  }

  rule {
    verbs      = ["create", "delete", "update", "patch", "deletecollection"]
    api_groups = ["resource.k8s.io"]
    resources  = ["resourceclaims", "resourceclaimtemplates"]
  }
}

resource "kubernetes_cluster_role" "kyverno_cleanup_controller" {
  metadata {
    name = "kyverno:cleanup-controller"

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  aggregation_rule {
    cluster_role_selectors {
      match_labels = {
        "rbac.kyverno.io/aggregate-to-cleanup-controller" = "true"
      }
    }

    cluster_role_selectors {
      match_labels = {
        "app.kubernetes.io/component" = "cleanup-controller"
        "app.kubernetes.io/instance"  = "kyverno"
        "app.kubernetes.io/part-of"   = "kyverno"
      }
    }
  }
}

resource "kubernetes_cluster_role" "kyverno_cleanup_controller_core" {
  metadata {
    name = "kyverno:cleanup-controller:core"

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["get"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "update", "watch"]
    api_groups = ["admissionregistration.k8s.io"]
    resources  = ["validatingwebhookconfigurations"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["namespaces"]
  }

  rule {
    verbs      = ["list", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["clustercleanuppolicies", "cleanuppolicies"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["deletingpolicies", "namespaceddeletingpolicies"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["deletingpolicies/status", "namespaceddeletingpolicies/status"]
  }

  rule {
    verbs      = ["get", "list", "patch", "update", "watch"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["policyexceptions"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["kyverno.io"]
    resources  = ["globalcontextentries", "globalcontextentries/status"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["kyverno.io"]
    resources  = ["clustercleanuppolicies/status", "cleanuppolicies/status"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["configmaps"]
  }

  rule {
    verbs      = ["create", "patch", "update"]
    api_groups = ["", "events.k8s.io"]
    resources  = ["events"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["authorization.k8s.io"]
    resources  = ["subjectaccessreviews"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_admin_policies" {
  metadata {
    name = "kyverno:rbac:admin:policies"

    labels = {
      "app.kubernetes.io/component"                  = "rbac"
      "app.kubernetes.io/instance"                   = "kyverno"
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "kyverno"
      "app.kubernetes.io/version"                    = "3.7.1"
      "helm.sh/chart"                                = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-admin" = "true"
    }
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["cleanuppolicies", "clustercleanuppolicies", "policies", "clusterpolicies"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_view_policies" {
  metadata {
    name = "kyverno:rbac:view:policies"

    labels = {
      "app.kubernetes.io/component"                 = "rbac"
      "app.kubernetes.io/instance"                  = "kyverno"
      "app.kubernetes.io/managed-by"                = "Helm"
      "app.kubernetes.io/part-of"                   = "kyverno"
      "app.kubernetes.io/version"                   = "3.7.1"
      "helm.sh/chart"                               = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-view" = "true"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["cleanuppolicies", "clustercleanuppolicies", "policies", "clusterpolicies"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_admin_policyreports" {
  metadata {
    name = "kyverno:rbac:admin:policyreports"

    labels = {
      "app.kubernetes.io/component"                  = "rbac"
      "app.kubernetes.io/instance"                   = "kyverno"
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "kyverno"
      "app.kubernetes.io/version"                    = "3.7.1"
      "helm.sh/chart"                                = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-admin" = "true"
    }
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["wgpolicyk8s.io"]
    resources  = ["policyreports", "clusterpolicyreports"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_view_policyreports" {
  metadata {
    name = "kyverno:rbac:view:policyreports"

    labels = {
      "app.kubernetes.io/component"                 = "rbac"
      "app.kubernetes.io/instance"                  = "kyverno"
      "app.kubernetes.io/managed-by"                = "Helm"
      "app.kubernetes.io/part-of"                   = "kyverno"
      "app.kubernetes.io/version"                   = "3.7.1"
      "helm.sh/chart"                               = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-view" = "true"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["wgpolicyk8s.io"]
    resources  = ["policyreports", "clusterpolicyreports"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_admin_reports" {
  metadata {
    name = "kyverno:rbac:admin:reports"

    labels = {
      "app.kubernetes.io/component"                  = "rbac"
      "app.kubernetes.io/instance"                   = "kyverno"
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "kyverno"
      "app.kubernetes.io/version"                    = "3.7.1"
      "helm.sh/chart"                                = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-admin" = "true"
    }
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["reports.kyverno.io"]
    resources  = ["ephemeralreports", "clusterephemeralreports"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_view_reports" {
  metadata {
    name = "kyverno:rbac:view:reports"

    labels = {
      "app.kubernetes.io/component"                 = "rbac"
      "app.kubernetes.io/instance"                  = "kyverno"
      "app.kubernetes.io/managed-by"                = "Helm"
      "app.kubernetes.io/part-of"                   = "kyverno"
      "app.kubernetes.io/version"                   = "3.7.1"
      "helm.sh/chart"                               = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-view" = "true"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["reports.kyverno.io"]
    resources  = ["ephemeralreports", "clusterephemeralreports"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_admin_updaterequests" {
  metadata {
    name = "kyverno:rbac:admin:updaterequests"

    labels = {
      "app.kubernetes.io/component"                  = "rbac"
      "app.kubernetes.io/instance"                   = "kyverno"
      "app.kubernetes.io/managed-by"                 = "Helm"
      "app.kubernetes.io/part-of"                    = "kyverno"
      "app.kubernetes.io/version"                    = "3.7.1"
      "helm.sh/chart"                                = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-admin" = "true"
    }
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["updaterequests"]
  }
}

resource "kubernetes_cluster_role" "kyverno_rbac_view_updaterequests" {
  metadata {
    name = "kyverno:rbac:view:updaterequests"

    labels = {
      "app.kubernetes.io/component"                 = "rbac"
      "app.kubernetes.io/instance"                  = "kyverno"
      "app.kubernetes.io/managed-by"                = "Helm"
      "app.kubernetes.io/part-of"                   = "kyverno"
      "app.kubernetes.io/version"                   = "3.7.1"
      "helm.sh/chart"                               = "kyverno-3.7.1"
      "rbac.authorization.k8s.io/aggregate-to-view" = "true"
    }
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["kyverno.io"]
    resources  = ["updaterequests"]
  }
}

resource "kubernetes_cluster_role" "kyverno_reports_controller" {
  metadata {
    name = "kyverno:reports-controller"

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  aggregation_rule {
    cluster_role_selectors {
      match_labels = {
        "rbac.kyverno.io/aggregate-to-reports-controller" = "true"
      }
    }

    cluster_role_selectors {
      match_labels = {
        "app.kubernetes.io/component" = "reports-controller"
        "app.kubernetes.io/instance"  = "kyverno"
        "app.kubernetes.io/part-of"   = "kyverno"
      }
    }
  }
}

resource "kubernetes_cluster_role" "kyverno_reports_controller_core" {
  metadata {
    name = "kyverno:reports-controller:core"

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["get"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["configmaps", "namespaces"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["kyverno.io"]
    resources  = ["globalcontextentries", "globalcontextentries/status", "policyexceptions", "policies", "clusterpolicies"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["validatingpolicies", "validatingpolicies/status", "namespacedvalidatingpolicies", "namespacedvalidatingpolicies/status", "imagevalidatingpolicies", "imagevalidatingpolicies/status", "namespacedimagevalidatingpolicies", "namespacedimagevalidatingpolicies/status", "generatingpolicies", "namespacedgeneratingpolicies", "mutatingpolicies", "namespacedmutatingpolicies"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["policyexceptions", "policyexceptions/status"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["admissionregistration.k8s.io"]
    resources  = ["validatingadmissionpolicies", "validatingadmissionpolicybindings"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["reports.kyverno.io"]
    resources  = ["ephemeralreports", "clusterephemeralreports"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["wgpolicyk8s.io"]
    resources  = ["policyreports", "policyreports/status", "clusterpolicyreports", "clusterpolicyreports/status"]
  }

  rule {
    verbs      = ["create", "delete", "get", "list", "patch", "update", "watch", "deletecollection"]
    api_groups = ["openreports.io"]
    resources  = ["reports", "reports/status", "clusterreports", "clusterreports/status"]
  }

  rule {
    verbs      = ["create", "patch"]
    api_groups = ["", "events.k8s.io"]
    resources  = ["events"]
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_admission_controller" {
  metadata {
    name = "kyverno:admission-controller"

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-admission-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kyverno:admission-controller"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_admission_controller_view" {
  metadata {
    name = "kyverno:admission-controller:view"

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-admission-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "view"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_background_controller" {
  metadata {
    name = "kyverno:background-controller"

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-background-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kyverno:background-controller"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_background_controller_view" {
  metadata {
    name = "kyverno:background-controller:view"

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-background-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "view"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_cleanup_controller" {
  metadata {
    name = "kyverno:cleanup-controller"

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-cleanup-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kyverno:cleanup-controller"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_reports_controller" {
  metadata {
    name = "kyverno:reports-controller"

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-reports-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kyverno:reports-controller"
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_reports_controller_view" {
  metadata {
    name = "kyverno:reports-controller:view"

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-reports-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "view"
  }
}

resource "kubernetes_role" "kyverno_admission_controller" {
  metadata {
    name      = "kyverno:admission-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["get", "list", "watch", "patch", "create", "update", "delete"]
    api_groups = [""]
    resources  = ["secrets", "serviceaccounts"]
  }

  rule {
    verbs          = ["get", "list", "watch"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["kyverno", "kyverno-metrics"]
  }

  rule {
    verbs      = ["create", "delete", "get", "patch", "update"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs      = ["get", "list", "watch", "patch", "update"]
    api_groups = ["apps"]
    resources  = ["deployments", "deployments/scale"]
  }
}

resource "kubernetes_role" "kyverno_background_controller" {
  metadata {
    name      = "kyverno:background-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs          = ["get", "list", "watch"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["kyverno", "kyverno-metrics"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs          = ["delete", "get", "patch", "update"]
    api_groups     = ["coordination.k8s.io"]
    resources      = ["leases"]
    resource_names = ["kyverno-background-controller"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets"]
  }
}

resource "kubernetes_role" "kyverno_cleanup_controller" {
  metadata {
    name      = "kyverno:cleanup-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs      = ["create"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs          = ["delete", "get", "list", "update", "watch"]
    api_groups     = [""]
    resources      = ["secrets"]
    resource_names = ["kyverno-cleanup-controller.kyverno.svc.kyverno-tls-ca", "kyverno-cleanup-controller.kyverno.svc.kyverno-tls-pair"]
  }

  rule {
    verbs          = ["get", "list", "watch"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["kyverno", "kyverno-metrics"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs          = ["delete", "get", "patch", "update"]
    api_groups     = ["coordination.k8s.io"]
    resources      = ["leases"]
    resource_names = ["kyverno-cleanup-controller"]
  }

  rule {
    verbs      = ["list"]
    api_groups = ["discovery.k8s.io"]
    resources  = ["endpointslices"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = ["apps"]
    resources  = ["deployments"]
  }
}

resource "kubernetes_role" "kyverno_reports_controller" {
  metadata {
    name      = "kyverno:reports-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  rule {
    verbs          = ["get", "list", "watch"]
    api_groups     = [""]
    resources      = ["configmaps"]
    resource_names = ["kyverno", "kyverno-metrics"]
  }

  rule {
    verbs      = ["get", "list", "watch"]
    api_groups = [""]
    resources  = ["secrets"]
  }

  rule {
    verbs      = ["create"]
    api_groups = ["coordination.k8s.io"]
    resources  = ["leases"]
  }

  rule {
    verbs          = ["delete", "get", "patch", "update"]
    api_groups     = ["coordination.k8s.io"]
    resources      = ["leases"]
    resource_names = ["kyverno-reports-controller"]
  }
}

resource "kubernetes_role_binding" "kyverno_admission_controller" {
  metadata {
    name      = "kyverno:admission-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "admission-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-admission-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "kyverno:admission-controller"
  }
}

resource "kubernetes_role_binding" "kyverno_background_controller" {
  metadata {
    name      = "kyverno:background-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "background-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-background-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "kyverno:background-controller"
  }
}

resource "kubernetes_role_binding" "kyverno_cleanup_controller" {
  metadata {
    name      = "kyverno:cleanup-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "cleanup-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-cleanup-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "kyverno:cleanup-controller"
  }
}

resource "kubernetes_role_binding" "kyverno_reports_controller" {
  metadata {
    name      = "kyverno:reports-controller"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/component"  = "reports-controller"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-reports-controller"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "Role"
    name      = "kyverno:reports-controller"
  }
}

resource "kubernetes_cluster_role" "kyverno_migrate_resources" {
  metadata {
    name = "kyverno:migrate-resources"

    labels = {
      "app.kubernetes.io/component"  = "hooks"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }

    annotations = {
      "helm.sh/hook"               = "post-upgrade"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded,hook-failed"
      "helm.sh/hook-weight"        = "100"
    }
  }

  rule {
    verbs      = ["get", "list", "update"]
    api_groups = ["kyverno.io"]
    resources  = ["*"]
  }

  rule {
    verbs      = ["get", "list", "update"]
    api_groups = ["policies.kyverno.io"]
    resources  = ["*"]
  }

  rule {
    verbs      = ["get"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions"]
  }

  rule {
    verbs      = ["update"]
    api_groups = ["apiextensions.k8s.io"]
    resources  = ["customresourcedefinitions/status"]
  }
}

resource "kubernetes_cluster_role_binding" "kyverno_migrate_resources" {
  metadata {
    name = "kyverno:migrate-resources"

    labels = {
      "app.kubernetes.io/component"  = "hooks"
      "app.kubernetes.io/instance"   = "kyverno"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/part-of"    = "kyverno"
      "app.kubernetes.io/version"    = "3.7.1"
      "helm.sh/chart"                = "kyverno-3.7.1"
    }

    annotations = {
      "helm.sh/hook"               = "post-upgrade"
      "helm.sh/hook-delete-policy" = "before-hook-creation,hook-succeeded,hook-failed"
      "helm.sh/hook-weight"        = "100"
    }
  }

  subject {
    kind      = "ServiceAccount"
    name      = "kyverno-migrate-resources"
    namespace = var.namespace
  }

  role_ref {
    api_group = "rbac.authorization.k8s.io"
    kind      = "ClusterRole"
    name      = "kyverno:migrate-resources"
  }
}

