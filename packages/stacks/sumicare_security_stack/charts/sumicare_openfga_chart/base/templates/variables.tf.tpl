/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for OpenFGA"
  type        = string
  default     = "openfga"
}

variable "openfga_version" {
  description = "Version of OpenFGA"
  type        = string
  default     = "{{ Version "openfga" }}"
}

variable "image" {
  description = "Container image for OpenFGA"
  type        = string
  default     = "openfga/openfga"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
