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
  description = "Kubernetes namespace for Ballista"
  type        = string
  default     = "ballista"
}

variable "ballista_version" {
  description = "Version of Ballista"
  type        = string
  default     = "51.0.0"
}

variable "scheduler_image" {
  description = "Container image for Ballista scheduler"
  type        = string
  default     = "apache/arrow-ballista-scheduler"
}

variable "executor_image" {
  description = "Container image for Ballista executor"
  type        = string
  default     = "apache/arrow-ballista-executor"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
