/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Grafana MCP"
  type        = string
  default     = "monitoring"
}

variable "grafana_mcp_version" {
  description = "Version of Grafana MCP"
  type        = string
  default     = "{{ Version "grafana-mcp" }}"
}

variable "image" {
  description = "Container image for Grafana MCP"
  type        = string
  default     = "docker.io/grafana/grafana-mcp"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
