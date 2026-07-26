/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Argo Events"
  type        = string
  default     = "argo-events"
}

variable "argo_events_version" {
  description = "Version of Argo Events"
  type        = string
  default     = "{{ Version "argo-events" }}"
}

variable "image" {
  description = "Container image for Argo Events"
  type        = string
  default     = "quay.io/argoproj/argo-events"
}

variable "webhook_replicas" {
  description = "Number of replicas for webhook"
  type        = number
  default     = 1
}

{{ OpenTofuVariableLivenessProbeTimeouts }}

{{ OpenTofuVariableReadinessProbeTimeouts }}

{{ OpenTofuVariableRevisionHistoryLimit }}
