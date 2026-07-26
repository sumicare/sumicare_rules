/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Tekton Dashboard"
  type        = string
  default     = "tekton-pipelines"
}

variable "tekton_operator_version" {
  description = "Version of Tekton Dashboard"
  type        = string
  default     = "{{ Version "tekton-dashboard" }}"
}

variable "image" {
  description = "Container image for Tekton Operator"
  type        = string
  default     = "gcr.io/tekton-releases/github.com/tektoncd/operator/cmd/kubernetes/operator"
}

variable "operator_image_digest" {
  description = "Digest for Tekton Operator image"
  type        = string
  default     = ""
}

variable "webhook_image" {
  description = "Container image for Tekton Operator Webhook"
  type        = string
  default     = "ghcr.io/tektoncd/operator/webhook-f2bb711aa8f0c0892856a4cbf6d9ddd8"
}

variable "webhook_image_digest" {
  description = "Digest for Tekton Operator Webhook image"
  type        = string
  default     = ""
}

variable "webhook_replicas" {
  description = "Number of replicas for webhook"
  type        = number
  default     = 1
}

variable "proxy_webhook_image" {
  description = "Container image for Tekton Pipelines Proxy Webhook"
  type        = string
  default     = ""
}

variable "job_pruner_image" {
  description = "Container image for Tekton Job Pruner"
  type        = string
  default     = ""
}

{{ OpenTofuVariableClusterDomain }}

{{ OpenTofuVariableRevisionHistoryLimit }}
