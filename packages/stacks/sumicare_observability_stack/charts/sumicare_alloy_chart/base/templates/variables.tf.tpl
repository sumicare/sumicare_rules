/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Alloy"
  type        = string
  default     = "monitoring"
}

variable "alloy_version" {
  description = "Version of Alloy"
  type        = string
  default     = "{{ Version "alloy" }}"
}

variable "image" {
  description = "Container image for Alloy"
  type        = string
  default     = "docker.io/grafana/alloy"
}

variable "config_reloader_image" {
  description = "Container image for config reloader"
  type        = string
  default     = "ghcr.io/jimmidyson/configmap-reload"
}

variable "config_reloader_version" {
  description = "Version of config reloader"
  type        = string
  default     = "{{ Version "configmap-reload" }}"
}
