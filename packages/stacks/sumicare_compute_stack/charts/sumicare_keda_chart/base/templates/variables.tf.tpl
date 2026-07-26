/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for KEDA"
  type        = string
  default     = "keda"
}

variable "keda_version" {
  description = "Version of KEDA"
  type        = string
  default     = "{{ Version "keda" }}"
}

variable "operator_replicas" {
  description = "Number of replicas for KEDA Operator"
  type        = number
  default     = 1
}

variable "metrics_server_replicas" {
  description = "Number of replicas for KEDA Metrics Server"
  type        = number
  default     = 1
}

variable "webhooks_replicas" {
  description = "Number of replicas for KEDA Admission Webhooks"
  type        = number
  default     = 1
}

variable "operator_image" {
  description = "KEDA Operator image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda"
}

variable "metrics_server_image" {
  description = "KEDA Metrics Server image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda-metrics-apiserver"
}

variable "webhooks_image" {
  description = "KEDA Admission Webhooks image repository"
  type        = string
  default     = "ghcr.io/kedacore/keda-admission-webhooks"
}

variable "image_pull_policy" {
  description = "Image pull policy"
  type        = string
  default     = "IfNotPresent"
}

variable "pod_annotations" {
  description = "Additional annotations for KEDA pods"
  type        = map(string)
  default     = {}
}

variable "service_account_annotations" {
  description = "Annotations for service account"
  type        = map(string)
  default     = {}
}

variable "webhooks_failure_policy" {
  description = "Failure policy for admission webhooks (Ignore or Fail)"
  type        = string
  default     = "Ignore"
}

{{ OpenTofuVariableClusterDomain }}

{{ OpenTofuVariableRevisionHistoryLimit }}
