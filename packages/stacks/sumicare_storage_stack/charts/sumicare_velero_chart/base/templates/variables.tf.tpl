/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Velero"
  type        = string
  default     = "velero"
}

variable "velero_version" {
  description = "Version of Velero"
  type        = string
  default     = "{{ Version "velero" }}"
}

variable "image" {
  description = "Container image for Velero"
  type        = string
  default     = "velero/velero"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
