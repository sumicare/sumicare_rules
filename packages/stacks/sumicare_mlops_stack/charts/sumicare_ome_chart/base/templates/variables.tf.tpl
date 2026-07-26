/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for OME"
  type        = string
  default     = "ome"
}

variable "ome_version" {
  description = "Version of OME"
  type        = string
  default     = "{{ Version "ome" }}"
}

variable "image" {
  description = "Container image for OME"
  type        = string
  default     = "ghcr.io/moirai-internal/ome-manager"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
