/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for Mimir"
  type        = string
  default     = "monitoring"
}

variable "mimir_version" {
  description = "Version of Mimir"
  type        = string
  default     = "{{ Version "mimir" }}"
}

variable "image" {
  description = "Container image for Mimir"
  type        = string
  default     = "docker.io/grafana/mimir"
}

variable "gateway_image" {
  description = "Container image for Mimir gateway"
  type        = string
  default     = "docker.io/nginxinc/nginx-unprivileged"
}

variable "gateway_version" {
  description = "Version of Mimir gateway"
  type        = string
  default     = "{{ Version "nginx" }}"
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

variable "minio_image" {
  description = "Container image for MinIO"
  type        = string
  default     = "minio/minio"
}

variable "minio_version" {
  description = "Version of MinIO"
  type        = string
  default     = "{{ Version "minio" }}"
}

variable "alertmanager_zone_replicas" {
  description = "Number of replicas per alertmanager zone"
  type        = number
  default     = 1
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

variable "index_cache_replicas" {
  description = "Number of replicas for index cache"
  type        = number
  default     = 1
}

variable "ingester_zone_replicas" {
  description = "Number of replicas per ingester zone"
  type        = number
  default     = 1
}

variable "kafka_replicas" {
  description = "Number of replicas for Kafka"
  type        = number
  default     = 1
}

variable "metadata_cache_replicas" {
  description = "Number of replicas for metadata cache"
  type        = number
  default     = 1
}

variable "overrides_exporter_replicas" {
  description = "Number of replicas for overrides exporter"
  type        = number
  default     = 1
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

variable "ruler_replicas" {
  description = "Number of replicas for ruler"
  type        = number
  default     = 1
}

variable "store_gateway_zone_replicas" {
  description = "Number of replicas per store gateway zone"
  type        = number
  default     = 1
}

{{ OpenTofuVariableResources }}

{{ OpenTofuVariableLivenessProbeTimeouts }}

{{ OpenTofuVariableReadinessProbeTimeouts }}

{{ OpenTofuVariableRunAsUserGroup }}

{{ OpenTofuVariableRevisionHistoryLimit }}
