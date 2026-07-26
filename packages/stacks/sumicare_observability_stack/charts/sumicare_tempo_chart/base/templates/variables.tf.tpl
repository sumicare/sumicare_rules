/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for Tempo"
  type        = string
  default     = "monitoring"
}

variable "tempo_version" {
  description = "Version of Tempo"
  type        = string
  default     = "{{ Version "tempo" }}"
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

{{ OpenTofuVariableRevisionHistoryLimit }}
