/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_manifest" "validatingwebhookconfiguration_benchmarkjob_ome_io" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind       = "ValidatingWebhookConfiguration"
    metadata = {
      annotations = {
        "cert-manager.io/inject-ca-from" = "${var.namespace}/serving-cert"
      }
      name = "benchmarkjob.ome.io"
    }
    webhooks = [
      {
        admissionReviewVersions = ["v1beta1"]
        clientConfig = {
          caBundle = "Cg=="
          service = {
            name      = "${local.app_name}-webhook-server-service"
            namespace = var.namespace
            path      = "/validate-ome-io-v1beta1-benchmarkjob"
          }
        }
        failurePolicy = "Fail"
        name          = "benchmarkjob.ome-webhook-server.validator"
        rules = [
          {
            apiGroups   = ["ome.io"]
            apiVersions = ["v1beta1"]
            operations  = ["CREATE", "UPDATE"]
            resources   = ["benchmarkjobs"]
          },
        ]
        sideEffects = "None"
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_inferenceservice_ome_io" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind       = "ValidatingWebhookConfiguration"
    metadata = {
      annotations = {
        "cert-manager.io/inject-ca-from" = "${var.namespace}/serving-cert"
      }
      name = "inferenceservice.ome.io"
    }
    webhooks = [
      {
        admissionReviewVersions = ["v1beta1"]
        clientConfig = {
          caBundle = "Cg=="
          service = {
            name      = "${local.app_name}-webhook-server-service"
            namespace = var.namespace
            path      = "/validate-ome-io-v1beta1-inferenceservice"
          }
        }
        failurePolicy = "Fail"
        name          = "inferenceservice.ome-webhook-server.validator"
        rules = [
          {
            apiGroups   = ["ome.io"]
            apiVersions = ["v1beta1"]
            operations  = ["CREATE", "UPDATE"]
            resources   = ["inferenceservices"]
          },
        ]
        sideEffects = "None"
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_clusterservingruntime_ome_io" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind       = "ValidatingWebhookConfiguration"
    metadata = {
      annotations = {
        "cert-manager.io/inject-ca-from" = "${var.namespace}/serving-cert"
      }
      name = "clusterservingruntime.ome.io"
    }
    webhooks = [
      {
        admissionReviewVersions = ["v1beta1"]
        clientConfig = {
          caBundle = "Cg=="
          service = {
            name      = "${local.app_name}-webhook-server-service"
            namespace = var.namespace
            path      = "/validate-ome-io-v1beta1-clusterservingruntime"
          }
        }
        failurePolicy = "Fail"
        name          = "clusterservingruntime.ome-webhook-server.validator"
        rules = [
          {
            apiGroups   = ["ome.io"]
            apiVersions = ["v1beta1"]
            operations  = ["CREATE", "UPDATE"]
            resources   = ["clusterservingruntimes"]
          },
        ]
        sideEffects = "None"
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_servingruntime_ome_io" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind       = "ValidatingWebhookConfiguration"
    metadata = {
      annotations = {
        "cert-manager.io/inject-ca-from" = "${var.namespace}/serving-cert"
      }
      name = "servingruntime.ome.io"
    }
    webhooks = [
      {
        admissionReviewVersions = ["v1beta1"]
        clientConfig = {
          caBundle = "Cg=="
          service = {
            name      = "${local.app_name}-webhook-server-service"
            namespace = var.namespace
            path      = "/validate-ome-io-v1beta1-servingruntime"
          }
        }
        failurePolicy = "Fail"
        name          = "servingruntime.ome-webhook-server.validator"
        rules = [
          {
            apiGroups   = ["ome.io"]
            apiVersions = ["v1beta1"]
            operations  = ["CREATE", "UPDATE"]
            resources   = ["servingruntimes"]
          },
        ]
        sideEffects = "None"
      },
    ]
  }
}
