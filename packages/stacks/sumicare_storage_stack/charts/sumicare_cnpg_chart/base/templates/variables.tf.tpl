/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for CloudNativePG"
  type        = string
  default     = "cnpg-system"
}

variable "cnpg_version" {
  description = "Version of CloudNativePG"
  type        = string
  default     = "{{ Version "cnpg" }}"
}

variable "image" {
  description = "Container image for CloudNativePG"
  type        = string
  default     = "ghcr.io/cloudnative-pg/cloudnative-pg"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
