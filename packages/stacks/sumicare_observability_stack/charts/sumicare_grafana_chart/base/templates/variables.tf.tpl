/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Grafana"
  type        = string
  default     = "monitoring"
}

variable "grafana_version" {
  description = "Version of Grafana"
  type        = string
  default     = "{{ Version "grafana" }}"
}

variable "image" {
  description = "Container image for Grafana"
  type        = string
  default     = "docker.io/grafana/grafana"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
