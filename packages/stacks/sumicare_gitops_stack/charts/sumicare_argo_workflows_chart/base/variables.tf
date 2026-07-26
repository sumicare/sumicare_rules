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
  description = "Kubernetes namespace for Argo Workflows"
  type        = string
  default     = "argo-workflows"
}

variable "argo_workflows_version" {
  description = "Version of Argo Workflows"
  type        = string
  default     = "4.0.1"
}

variable "controller_image" {
  description = "Container image for Argo Workflows controller"
  type        = string
  default     = "quay.io/argoproj/workflow-controller"
}

variable "controller_replicas" {
  description = "Number of replicas for controller"
  type        = number
  default     = 1
}

variable "server_image" {
  description = "Container image for Argo Workflows server"
  type        = string
  default     = "quay.io/argoproj/argocli"
}

variable "server_replicas" {
  description = "Number of replicas for server"
  type        = number
  default     = 1
}

variable "executor_image" {
  description = "Container image for Argo Workflows executor"
  type        = string
  default     = "quay.io/argoproj/argoexec"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
