/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Kyverno"
  type        = string
  default     = "kyverno"
}

variable "kyverno_version" {
  description = "Version of Kyverno"
  type        = string
  default     = "{{ Version "kyverno" }}"
}

variable "image" {
  description = "Container image for Kyverno"
  type        = string
  default     = "ghcr.io/kyverno/kyverno"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
