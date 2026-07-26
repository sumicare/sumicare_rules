/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

variable "org" {
  description = "Organization Name, used for image tagging."
  type        = string
  default     = "sumicare"
}

variable "repository" {
  description = "Image repository path, with trailing '/'."
  type        = string
  default     = "repo.sumi.care"
}

variable "env" {
  description = "Environment"
  type        = string
  default     = "dev"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.env)
    error_message = "Env must be one of dev, staging, or prod."
  }
}

variable "replicas" {
  description = "Number of replicas for the deployment"
  type        = number
  default     = 3
}

variable "namespace" {
  description = "Kubernetes namespace for Tekton Pipelines"
  type        = string
  default     = "tekton-pipelines"
}

variable "tekton_operator_version" {
  description = "Version of Tekton Pipelines"
  type        = string
  default     = "1.10.0"
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

variable "cluster_domain" {
  description = "Kubernetes cluster domain"
  type        = string
  default     = "cluster.local"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
