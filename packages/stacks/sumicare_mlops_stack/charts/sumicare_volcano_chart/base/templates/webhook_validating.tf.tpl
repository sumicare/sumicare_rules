/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_manifest" "validatingwebhookconfiguration_volcano_admission_service_jobs_validate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-jobs-validate"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "release-name-admission-service"
            namespace = var.namespace
            path = "/jobs/validate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "validatejob.volcano.sh"
        namespaceSelector = {
          matchExpressions = [
            {
              key = "kubernetes.io/metadata.name"
              operator = "NotIn"
              values = [
                var.namespace,
                "kube-system",
              ]
            },
          ]
        }
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "batch.volcano.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "jobs",
            ]
            scope = "*"
          },
        ]
        sideEffects = "NoneOnDryRun"
        timeoutSeconds = 10
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_volcano_admission_service_queues_validate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-queues-validate"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "release-name-admission-service"
            namespace = var.namespace
            path = "/queues/validate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "validatequeue.volcano.sh"
        namespaceSelector = {
          matchExpressions = [
            {
              key = "kubernetes.io/metadata.name"
              operator = "NotIn"
              values = [
                var.namespace,
                "kube-system",
              ]
            },
          ]
        }
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "scheduling.volcano.sh",
            ]
            apiVersions = [
              "v1beta1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
              "DELETE",
            ]
            resources = [
              "queues",
            ]
            scope = "*"
          },
        ]
        sideEffects = "NoneOnDryRun"
        timeoutSeconds = 10
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_volcano_admission_service_podgroups_validate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-podgroups-validate"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "release-name-admission-service"
            namespace = var.namespace
            path = "/podgroups/validate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "validatepodgroup.volcano.sh"
        namespaceSelector = {
          matchExpressions = [
            {
              key = "kubernetes.io/metadata.name"
              operator = "NotIn"
              values = [
                var.namespace,
                "kube-system",
              ]
            },
          ]
        }
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "scheduling.volcano.sh",
            ]
            apiVersions = [
              "v1beta1",
            ]
            operations = [
              "CREATE",
            ]
            resources = [
              "podgroups",
            ]
            scope = "*"
          },
        ]
        sideEffects = "NoneOnDryRun"
        timeoutSeconds = 10
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_volcano_admission_service_hypernodes_validate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-hypernodes-validate"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "release-name-admission-service"
            namespace = var.namespace
            path = "/hypernodes/validate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "validatehypernodes.volcano.sh"
        rules = [
          {
            apiGroups = [
              "topology.volcano.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "hypernodes",
            ]
          },
        ]
        sideEffects = "None"
        timeoutSeconds = 10
      },
    ]
  }
}

resource "kubernetes_manifest" "validatingwebhookconfiguration_volcano_admission_service_cronjobs_validate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "ValidatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-cronjobs-validate"
    }
    webhooks = [
      {
        admissionReviewVersions = [
          "v1",
        ]
        clientConfig = {
          service = {
            name = "release-name-admission-service"
            namespace = var.namespace
            path = "/cronjobs/validate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "validatecronjob.volcano.sh"
        namespaceSelector = {
          matchExpressions = [
            {
              key = "kubernetes.io/metadata.name"
              operator = "NotIn"
              values = [
                var.namespace,
                "kube-system",
              ]
            },
          ]
        }
        objectSelector = {}
        rules = [
          {
            apiGroups = [
              "batch.volcano.sh",
            ]
            apiVersions = [
              "v1alpha1",
            ]
            operations = [
              "CREATE",
              "UPDATE",
            ]
            resources = [
              "cronjobs",
            ]
            scope = "*"
          },
        ]
        sideEffects = "NoneOnDryRun"
        timeoutSeconds = 10
      },
    ]
  }
}
