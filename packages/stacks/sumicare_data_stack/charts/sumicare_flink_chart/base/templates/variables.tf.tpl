/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for NATS"
  type        = string
  default     = "nats"
}

variable "nats_version" {
  description = "Version of NATS"
  type        = string
  default     = "{{ Version "nats" }}"
}

variable "image" {
  description = "Container image for NATS"
  type        = string
  default     = "nats"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
