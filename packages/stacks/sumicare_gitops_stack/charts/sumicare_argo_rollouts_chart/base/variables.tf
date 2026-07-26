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
  description = "Kubernetes namespace for Argo Rollouts"
  type        = string
  default     = "argo-rollouts"
}

variable "argo_rollouts_version" {
  description = "Version of Argo Rollouts"
  type        = string
  default     = "1.8.4"
}

variable "image" {
  description = "Container image for Argo Rollouts"
  type        = string
  default     = "quay.io/argoproj/argo-rollouts"
}

variable "dashboard_replicas" {
  description = "Number of replicas for dashboard"
  type        = number
  default     = 1
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
