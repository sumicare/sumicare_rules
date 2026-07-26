/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Argo Rollouts"
  type        = string
  default     = "argo-rollouts"
}

variable "argo_rollouts_version" {
  description = "Version of Argo Rollouts"
  type        = string
  default     = "{{ Version "argo-rollouts" }}"
}

variable "image" {
  description = "Container image for Argo Rollouts"
  type        = string
  default     = "quay.io/argoproj/argo-rollouts"
}

variable "dashboard_replicas" {
  description = "Number of replicas for dashboard"
  type        = number
  default     = 1
}

{{ OpenTofuVariableRevisionHistoryLimit }}
