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
  description = "Kubernetes namespace for Dex"
  type        = string
  default     = "dex"
}

variable "dex_version" {
  description = "Version of Dex"
  type        = string
  default     = "2.45.1"
}

variable "image" {
  description = "Container image for Dex"
  type        = string
  default     = "ghcr.io/dexidp/dex"
}

variable "http_port" {
  description = "HTTP port for Dex"
  type        = number
  default     = 5556
}

variable "telemetry_port" {
  description = "Telemetry port for Dex"
  type        = number
  default     = 5558
}

variable "config_secret_data" {
  description = "Dex configuration secret data"
  type        = string
  default     = "{}"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
