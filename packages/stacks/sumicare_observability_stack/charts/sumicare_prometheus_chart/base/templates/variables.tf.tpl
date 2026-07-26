/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Prometheus"
  type        = string
  default     = "monitoring"
}

variable "prometheus_version" {
  description = "Version of Prometheus"
  type        = string
  default     = "{{ Version "prometheus" }}"
}

variable "image" {
  description = "Container image for Prometheus"
  type        = string
  default     = "quay.io/prometheus/prometheus"
}

{{ OpenTofuVariableRevisionHistoryLimit }}

# Component versions
variable "alertmanager_version" {
  description = "Alertmanager version"
  type        = string
  default     = "{{ Version "alertmanager" }}"
}

variable "kube_state_metrics_version" {
  description = "Kube State Metrics version"
  type        = string
  default     = "{{ Version "kube-state-metrics" }}"
}

variable "node_exporter_version" {
  description = "Node Exporter version"
  type        = string
  default     = "{{ Version "node-exporter" }}"
}

variable "pushgateway_version" {
  description = "Pushgateway version"
  type        = string
  default     = "{{ Version "pushgateway" }}"
}

variable "config_reloader_version" {
  description = "Config reloader version"
  type        = string
  default     = "{{ Version "prometheus-config-reloader" }}"
}

# Component images
variable "alertmanager_image" {
  description = "Alertmanager image"
  type        = string
  default     = "prom/alertmanager"
}

variable "kube_state_metrics_image" {
  description = "Kube State Metrics image"
  type        = string
  default     = "registry.k8s.io/kube-state-metrics/kube-state-metrics"
}

variable "node_exporter_image" {
  description = "Node Exporter image"
  type        = string
  default     = "quay.io/prom/node-exporter"
}

variable "pushgateway_image" {
  description = "Pushgateway image"
  type        = string
  default     = "prom/pushgateway"
}

variable "config_reloader_image" {
  description = "Config reloader image"
  type        = string
  default     = "quay.io/prometheus-operator/prometheus-config-reloader"
}

# Component replicas
variable "alertmanager_replicas" {
  description = "Alertmanager replicas"
  type        = number
  default     = 1
}

variable "kube_state_metrics_replicas" {
  description = "Kube State Metrics replicas"
  type        = number
  default     = 1
}

variable "pushgateway_replicas" {
  description = "Pushgateway replicas"
  type        = number
  default     = 1
}

# Storage
variable "alertmanager_storage_size" {
  description = "Alertmanager storage size"
  type        = string
  default     = "2Gi"
}

variable "server_storage_size" {
  description = "Prometheus server storage size"
  type        = string
  default     = "8Gi"
}

variable "storage_retention_time" {
  description = "Prometheus storage retention time"
  type        = string
  default     = "15d"
}

# Common settings
variable "priority_class_name" {
  description = "Priority class name"
  type        = string
  default     = ""
}

variable "extra_args" {
  description = "Extra arguments for components"
  type        = list(string)
  default     = []
}

variable "telemetry_disabled" {
  description = "Disable telemetry"
  type        = bool
  default     = false
}

# Resource configurations
variable "container_resources" {
  description = "Container resource configurations"
  type        = map(any)
  default     = {}
}

variable "pod_security_context" {
  description = "Pod security context"
  type        = map(any)
  default     = {}
}

variable "container_security_context" {
  description = "Container security context"
  type        = map(any)
  default     = {}
}
