/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_manifest" "validatingwebhookconfiguration_keda_admission" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      labels = local.webhook_labels
      name = "keda-admission"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-keda-sh-v1alpha1-scaledobject"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vscaledobject.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "scaledobjects",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-keda-sh-v1alpha1-scaledjob"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vscaledjob.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "scaledjobs",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-keda-sh-v1alpha1-triggerauthentication"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vstriggerauthentication.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "triggerauthentications",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-keda-sh-v1alpha1-clustertriggerauthentication"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vsclustertriggerauthentication.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "clustertriggerauthentications",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-eventing-keda-sh-v1alpha1-cloudeventsource"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vcloudeventsource.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "eventing.keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "cloudeventsources",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "keda-admission-webhooks"
            namespace = var.namespace
            path = "/validate-eventing-keda-sh-v1alpha1-clustercloudeventsource"
          }
        }
        failurePolicy = var.webhooks_failure_policy
        matchPolicy = "Equivalent"
        name = "vclustercloudeventsource.kb.io"
        namespaceSelector = {}
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "eventing.keda.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "clustercloudeventsources",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
    ]
  }
}
