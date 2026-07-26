resource "kubernetes_manifest" "mutatingwebhookconfiguration_kubearmor_kubearmor_controller_mutating_webhook_configuration" {
  manifest = {
    "apiVersion" = "admissionregistration.k8s.io/v1"
    "kind" = "MutatingWebhookConfiguration"
    "metadata" = {
      "name" = "kubearmor-controller-mutating-webhook-configuration"
      "namespace" = "kubearmor"
    }
    "webhooks" = [
      {
        "admissionReviewVersions" = [
          "v1",
        ]
        "clientConfig" = {
          "caBundle" = "LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURLVENDQWhHZ0F3SUJBZ0lRUGpMd0xqL2l6djR3WXhzTlNodC82VEFOQmdrcWhraUc5dzBCQVFzRkFEQWYKTVIwd0d3WURWUVFERXhScmRXSmxZWEp0YjNJdFkyOXVkSEp2Ykd4bGNqQWVGdzB5TmpBek1EVXhNelUxTURGYQpGdzB5T1RBek1EUXhNelUxTURGYU1COHhIVEFiQmdOVkJBTVRGR3QxWW1WaGNtMXZjaTFqYjI1MGNtOXNiR1Z5Ck1JSUJJakFOQmdrcWhraUc5dzBCQVFFRkFBT0NBUThBTUlJQkNnS0NBUUVBemJVdlI1eGlzUFVDcDlTa0RRUisKdmZYMGZzSmRSMGxRS21tdnFQbkFOSTg1UVk1VmdDQW1WbnFpMHFSb2lHT0lIU01pbXVCTWlHVWtrTVFxa0U2cwpSRlpTbG5FZ1NQMHNidUdJdGJ4N2xYeFRDQnROemxOdEl5Vk9MV1NZUHFLVWpNOGNLUUlFWHhzMVVGTEgzUW03Ck15UVFSbnRTekJ3b2tyS294VVFmejR4ZEVoZjY4QWpVZUV3QzlpbFR4THE1a0w5NkFHTnpXYVhBOGJHUHVob1oKeFpQSUZSN3FUbXJoQ0J3dUdzNVgrcGYyVlBkOFFaUWh4MDUwSXNNaC9LM3B0WXBSQ0FJTHlSZ1pNanMyTHc3cwpwbGQwMFRzbi9FbWwwMytkNEJVR2ZFZDk5WXFIMnMyelg4VVlSc1ZwTzRMYTJ5VHZMdEJMY0krVFpoVUYvV0xXCkV3SURBUUFCbzJFd1h6QU9CZ05WSFE4QkFmOEVCQU1DQXFRd0hRWURWUjBsQkJZd0ZBWUlLd1lCQlFVSEF3RUcKQ0NzR0FRVUZCd01DTUE4R0ExVWRFd0VCL3dRRk1BTUJBZjh3SFFZRFZSME9CQllFRk05c0JXaFhYdUZ4cDFNMApZeUdUOWtqZk96MTZNQTBHQ1NxR1NJYjNEUUVCQ3dVQUE0SUJBUUFMVC82TmpUWjVPMkpTQ2dmSDBnMHJmR2ozCmJ3Zno5SWVwQlBvTVJydVdoSm1xOUhCKzh6cjRHVlk5T2taWFVseFpMbDZ5ZmFxWFV5TFJHSDdHSndaY05WTUcKSmM0SUdGT0QxcksvQm9WeDRZRkRWc2ZmUFYrYjZGNEh0dk1iTW5laFI4YU5Ecm1FL1NvZWZpRTJONGlBUEF3VQowaWhiaTR2NVUxbGgxWWFkZTZtdUc2dWRvRTNGWFFMbE9SUzEwVUpXOGFaUDdzZmNNQk8zYnhLSzZYMDJXN004CjZwRVZRUGowWnBSaVlCeGkzUjBZMmw0MjJrRDZJa1phcS9KYk1Bc0RrZFZjbC9pcGlkMi9uSENQckFKRUFQUUQKSG1nTlRXZC85MDkrUmg4V010VlJhamNiazlYOFpsMW1nY09qdDVXdEtQWmwwZWJhWXhaRWFleEYzTjNCCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K"
          "service" = {
            "name" = "kubearmor-controller-webhook-service"
            "namespace" = "kubearmor"
            "path" = "/mutate-pods"
          }
        }
        "failurePolicy" = "Ignore"
        "name" = "annotation.kubearmor.com"
        "objectSelector" = {
          "matchExpressions" = [
            {
              "key" = "kubearmor-app"
              "operator" = "DoesNotExist"
            },
          ]
        }
        "rules" = [
          {
            "apiGroups" = [
              "",
            ]
            "apiVersions" = [
              "v1",
            ]
            "operations" = [
              "CREATE",
              "UPDATE",
            ]
            "resources" = [
              "pods",
              "pods/binding",
            ]
            "scope" = "*"
          },
        ]
        "sideEffects" = "NoneOnDryRun"
      },
    ]
  }
}
