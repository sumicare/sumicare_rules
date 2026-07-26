/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Valkey Operator"
  type        = string
  default     = "valkey-operator"
}

variable "valkey_operator_version" {
  description = "Version of Valkey Operator"
  type        = string
  default     = "{{ Version "valkey-operator" }}"
}

variable "image" {
  description = "Container image for Valkey Operator"
  type        = string
  default     = "docker.io/valkey/operator"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
