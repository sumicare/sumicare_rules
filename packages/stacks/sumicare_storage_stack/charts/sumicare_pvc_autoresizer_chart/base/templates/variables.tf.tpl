/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for PVC Autoresizer"
  type        = string
  default     = "pvc-autoresizer"
}

variable "pvc_autoresizer_version" {
  description = "Version of PVC Autoresizer"
  type        = string
  default     = "{{ Version "pvc-autoresizer" }}"
}

variable "image" {
  description = "Container image for PVC Autoresizer"
  type        = string
  default     = "ghcr.io/topolvm/pvc-autoresizer"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
