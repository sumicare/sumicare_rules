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
  description = "Kubernetes namespace for Grafana MCP"
  type        = string
  default     = "monitoring"
}

variable "grafana_mcp_version" {
  description = "Version of Grafana MCP"
  type        = string
  default     = "0.11.2"
}

variable "image" {
  description = "Container image for Grafana MCP"
  type        = string
  default     = "docker.io/grafana/grafana-mcp"
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
