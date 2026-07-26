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
  description = "Kubernetes namespace for Argo Events"
  type        = string
  default     = "argo-events"
}

variable "argo_events_version" {
  description = "Version of Argo Events"
  type        = string
  default     = "1.9.10"
}

variable "image" {
  description = "Container image for Argo Events"
  type        = string
  default     = "quay.io/argoproj/argo-events"
}

variable "webhook_replicas" {
  description = "Number of replicas for webhook"
  type        = number
  default     = 1
}

variable "liveness_probe_initial_delay" {
  description = "Initial delay for liveness/readiness probes"
  type        = number
  default     = 1
}

variable "liveness_probe_timeout" {
  description = "Timeout for liveness/readiness probes"
  type        = number
  default     = 2
}

variable "liveness_probe_period" {
  description = "Period for liveness/readiness probes"
  type        = number
  default     = 5
}

variable "liveness_probe_failure_threshold" {
  description = "Failure threshold for liveness/readiness probes"
  type        = number
  default     = 2
}

variable "readiness_probe_initial_delay" {
  description = "Initial delay for liveness/readiness probes"
  type        = number
  default     = 1
}

variable "readiness_probe_timeout" {
  description = "Timeout for liveness/readiness probes"
  type        = number
  default     = 2
}

variable "readiness_probe_period" {
  description = "Period for liveness/readiness probes"
  type        = number
  default     = 5
}

variable "readiness_probe_failure_threshold" {
  description = "Failure threshold for liveness/readiness probes"
  type        = number
  default     = 2
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
