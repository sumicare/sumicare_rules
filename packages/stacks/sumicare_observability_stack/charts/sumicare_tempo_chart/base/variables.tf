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
  description = "Kubernetes namespace for Tempo"
  type        = string
  default     = "monitoring"
}

variable "tempo_version" {
  description = "Version of Tempo"
  type        = string
  default     = "2.10.1"
}

variable "image" {
  description = "Container image for Tempo"
  type        = string
  default     = "docker.io/grafana/tempo"
}

variable "distributor_replicas" {
  description = "Number of replicas for distributor"
  type        = number
  default     = 3
}

variable "ingester_replicas" {
  description = "Number of replicas for ingester"
  type        = number
  default     = 3
}

variable "querier_replicas" {
  description = "Number of replicas for querier"
  type        = number
  default     = 3
}

variable "query_frontend_replicas" {
  description = "Number of replicas for query frontend"
  type        = number
  default     = 3
}

variable "compactor_replicas" {
  description = "Number of replicas for compactor"
  type        = number
  default     = 1
}

variable "memcached_replicas" {
  description = "Number of replicas for memcached"
  type        = number
  default     = 1
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
