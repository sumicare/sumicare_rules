/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Garage"
  type        = string
  default     = "garage"
}

variable "garage_version" {
  description = "Version of Garage"
  type        = string
  default     = "{{ Version "garage" }}"
}

variable "image" {
  description = "Container image for Garage"
  type        = string
  default     = "dxflrs/garage"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
