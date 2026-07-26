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

variable "namespace" {
  description = "Kubernetes namespace for KEDA"
  type        = string
  default     = "keda"
}

variable "keda_version" {
  description = "Version of KEDA"
  type        = string
  default     = "2.19.0"
}

variable "operator_replicas" {
  description = "Number of replicas for KEDA Operator"
  type        = number
  default     = 1
}

variable "metrics_server_replicas" {
  description = "Number of replicas for KEDA Metrics Server"
  type        = number
  default     = 1
}

variable "webhooks_replicas" {
  description = "Number of replicas for KEDA Admission Webhooks"
  type        = number
  default     = 1
}

variable "operator_image" {
  description = "KEDA Operator image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda"
}

variable "metrics_server_image" {
  description = "KEDA Metrics Server image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda-metrics-apiserver"
}

variable "webhooks_image" {
  description = "KEDA Admission Webhooks image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda-admission-webhooks"
}

variable "image_pull_policy" {
  description = "Image pull policy"
  type        = string
  default     = "IfNotPresent"
}

variable "pod_annotations" {
  description = "Additional annotations for KEDA pods"
  type        = map(string)
  default     = {}
}

variable "service_account_annotations" {
  description = "Annotations for service account"
  type        = map(string)
  default     = {}
}

variable "webhooks_failure_policy" {
  description = "Failure policy for admission webhooks (Ignore or Fail)"
  type        = string
  default     = "Ignore"
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
