/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for TopoLVM"
  type        = string
  default     = "topolvm-system"
}

variable "topolvm_version" {
  description = "Version of TopoLVM"
  type        = string
  default     = "{{ Version "topolvm" }}"
}

variable "image" {
  description = "Container image for TopoLVM"
  type        = string
  default     = "ghcr.io/topolvm/topolvm-with-sidecar"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
