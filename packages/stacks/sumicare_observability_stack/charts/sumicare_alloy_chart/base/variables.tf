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
  description = "Kubernetes namespace for Alloy"
  type        = string
  default     = "monitoring"
}

variable "alloy_version" {
  description = "Version of Alloy"
  type        = string
  default     = "1.13.2"
}

variable "image" {
  description = "Container image for Alloy"
  type        = string
  default     = "docker.io/grafana/alloy"
}

variable "config_reloader_image" {
  description = "Container image for config reloader"
  type        = string
  default     = "ghcr.io/jimmidyson/configmap-reload"
}

variable "config_reloader_version" {
  description = "Version of config reloader"
  type        = string
  default     = ""
}
