/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Dex"
  type        = string
  default     = "dex"
}

variable "dex_version" {
  description = "Version of Dex"
  type        = string
  default     = "{{ Version "dex" }}"
}

variable "image" {
  description = "Container image for Dex"
  type        = string
  default     = "ghcr.io/dexidp/dex"
}

{{ OpenTofuVariablePort "http" "HTTP port for Dex" "5556" }}

{{ OpenTofuVariablePort "telemetry" "Telemetry port for Dex" "5558" }}

variable "config_secret_data" {
  description = "Dex configuration secret data"
  type        = string
  default     = "{}"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
