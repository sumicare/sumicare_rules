/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for Loki"
  type        = string
  default     = "monitoring"
}

variable "loki_version" {
  description = "Version of Loki"
  type        = string
  default     = "{{ Version "loki" }}"
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
  default     = "{{ Version "nginx" }}"
}

variable "sidecar_image" {
  description = "Container image for sidecar"
  type        = string
  default     = "ghcr.io/kiwigrid/k8s-sidecar"
}

variable "sidecar_version" {
  description = "Version of sidecar"
  type        = string
  default     = "{{ Version "k8s-sidecar" }}"
}

variable "rollout_operator_image" {
  description = "Container image for rollout operator"
  type        = string
  default     = "docker.io/grafana/rollout-operator"
}

variable "rollout_operator_version" {
  description = "Version of rollout operator"
  type        = string
  default     = "{{ Version "rollout-operator" }}"
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

{{ OpenTofuVariableResources }}

{{ OpenTofuVariableReadinessProbeTimeouts }}

{{ OpenTofuVariableRunAsUserGroup }}

{{ OpenTofuVariableRevisionHistoryLimit }}
