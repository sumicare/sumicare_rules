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
  description = "Kubernetes namespace for Volcano"
  type        = string
  default     = "volcano-system"
}

variable "volcano_version" {
  description = "Version of Volcano"
  type        = string
  default     = "1.14.1"
}

variable "image" {
  description = "Container image for Volcano controller manager"
  type        = string
  default     = "docker.io/volcanosh/vc-controller-manager"
}

variable "webhook_image" {
  description = "Container image for Volcano webhook manager"
  type        = string
  default     = "docker.io/volcanosh/vc-webhook-manager"
}

variable "scheduler_image" {
  description = "Container image for Volcano scheduler"
  type        = string
  default     = "docker.io/volcanosh/vc-scheduler"
}

variable "agent_image" {
  description = "Container image for Volcano agent"
  type        = string
  default     = "docker.io/volcanosh/vc-agent"
}

variable "kube_state_metrics_image" {
  description = "Container image for kube-state-metrics"
  type        = string
  default     = "docker.io/volcanosh/kube-state-metrics"
}

variable "kube_state_metrics_version" {
  description = "Version of kube-state-metrics"
  type        = string
  default     = "v2.0.0-beta"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
