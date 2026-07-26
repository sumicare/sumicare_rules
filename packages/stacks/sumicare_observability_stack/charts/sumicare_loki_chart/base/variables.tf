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
  description = "Kubernetes namespace for Loki"
  type        = string
  default     = "monitoring"
}

variable "loki_version" {
  description = "Version of Loki"
  type        = string
  default     = "3.6.7"
}

variable "image" {
  description = "Container image for Loki"
  type        = string
  default     = "docker.io/grafana/loki"
}

variable "gateway_image" {
  description = "Container image for Loki gateway"
  type        = string
  default     = "docker.io/nginxinc/nginx-unprivileged"
}

variable "gateway_version" {
  description = "Version of Loki gateway"
  type        = string
  default     = ""
}

variable "sidecar_image" {
  description = "Container image for sidecar"
  type        = string
  default     = "ghcr.io/kiwigrid/k8s-sidecar"
}

variable "sidecar_version" {
  description = "Version of sidecar"
  type        = string
  default     = ""
}

variable "rollout_operator_image" {
  description = "Container image for rollout operator"
  type        = string
  default     = "docker.io/grafana/rollout-operator"
}

variable "rollout_operator_version" {
  description = "Version of rollout operator"
  type        = string
  default     = ""
}

variable "rollout_operator_replicas" {
  description = "Number of replicas for rollout operator"
  type        = number
  default     = 1
}

variable "backend_replicas" {
  description = "Number of replicas for backend"
  type        = number
  default     = 3
}

variable "bloom_builder_replicas" {
  description = "Number of replicas for bloom builder"
  type        = number
  default     = 0
}

variable "bloom_gateway_replicas" {
  description = "Number of replicas for bloom gateway"
  type        = number
  default     = 0
}

variable "bloom_planner_replicas" {
  description = "Number of replicas for bloom planner"
  type        = number
  default     = 0
}

variable "chunks_cache_replicas" {
  description = "Number of replicas for chunks cache"
  type        = number
  default     = 1
}

variable "compactor_replicas" {
  description = "Number of replicas for compactor"
  type        = number
  default     = 1
}

variable "distributor_replicas" {
  description = "Number of replicas for distributor"
  type        = number
  default     = 3
}

variable "gateway_replicas" {
  description = "Number of replicas for gateway"
  type        = number
  default     = 1
}

variable "index_gateway_replicas" {
  description = "Number of replicas for index gateway"
  type        = number
  default     = 1
}

variable "ingester_zone_replicas" {
  description = "Number of replicas per ingester zone"
  type        = number
  default     = 1
}

variable "pattern_ingester_replicas" {
  description = "Number of replicas for pattern ingester"
  type        = number
  default     = 0
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

variable "query_scheduler_replicas" {
  description = "Number of replicas for query scheduler"
  type        = number
  default     = 2
}

variable "read_replicas" {
  description = "Number of replicas for read"
  type        = number
  default     = 3
}

variable "results_cache_replicas" {
  description = "Number of replicas for results cache"
  type        = number
  default     = 1
}

variable "ruler_replicas" {
  description = "Number of replicas for ruler"
  type        = number
  default     = 1
}

variable "write_replicas" {
  description = "Number of replicas for write"
  type        = number
  default     = 3
}

variable "resources" {
  description = "Resource requests and limits for the container"
  type = object({
    requests = object({
      cpu    = string
      memory = string
    })
    limits = object({
      cpu    = string
      memory = string
    })
  })
  default = {
    requests = {
      cpu    = "100m"
      memory = "64Mi"
    }
    limits = {
      cpu    = "250m"
      memory = "512Mi"
    }
  }
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

variable "run_as_user" {
  description = "User user ID to run the container as"
  type        = number
  default     = 65532
}

variable "run_as_group" {
  description = "User group ID to run the container as"
  type        = number
  default     = 65532
}

variable "fs_group" {
  description = "Filesystem group ID for pod volumes"
  type        = number
  default     = 65532
}

variable "revision_history_limit" {
  description = "Revision history limit for the deployment"
  type        = number
  default     = 10
}
