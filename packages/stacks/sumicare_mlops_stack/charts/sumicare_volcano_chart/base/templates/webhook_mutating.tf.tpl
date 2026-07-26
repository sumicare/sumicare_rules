/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_manifest" "mutatingwebhookconfiguration_volcano_admission_service_queues_mutate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "MutatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-queues-mutate"
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
            path = "/queues/mutate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "mutatequeue.volcano.sh"
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
        reinvocationPolicy = "Never"
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

resource "kubernetes_manifest" "mutatingwebhookconfiguration_volcano_admission_service_jobs_mutate" {
  manifest = {
    apiVersion = "admissionregistration.k8s.io/v1"
    kind = "MutatingWebhookConfiguration"
    metadata = {
      name = "volcano-admission-service-jobs-mutate"
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
            path = "/jobs/mutate"
            port = 443
          }
        }
        failurePolicy = "Fail"
        matchPolicy = "Equivalent"
        name = "mutatejob.volcano.sh"
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
        reinvocationPolicy = "Never"
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
