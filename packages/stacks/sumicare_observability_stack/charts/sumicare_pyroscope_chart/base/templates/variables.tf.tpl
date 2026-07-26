/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Pyroscope"
  type        = string
  default     = "monitoring"
}

variable "pyroscope_version" {
  description = "Version of Pyroscope"
  type        = string
  default     = "{{ Version "pyroscope" }}"
}

variable "image" {
  description = "Container image for Pyroscope"
  type        = string
  default     = "docker.io/grafana/pyroscope"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
