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
  description = "Kubernetes namespace for ExternalDNS"
  type        = string
  default     = "external-dns"
}

variable "external_dns_version" {
  description = "Version of ExternalDNS"
  type        = string
  default     = "0.20.0"
}

variable "image" {
  description = "Container image for ExternalDNS"
  type        = string
  default     = "registry.k8s.io/external-dns/external-dns"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
