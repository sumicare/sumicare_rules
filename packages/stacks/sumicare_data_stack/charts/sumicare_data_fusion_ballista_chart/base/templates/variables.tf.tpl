/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Ballista"
  type        = string
  default     = "ballista"
}

variable "ballista_version" {
  description = "Version of Ballista"
  type        = string
  default     = "{{ Version "ballista" }}"
}

variable "scheduler_image" {
  description = "Container image for Ballista scheduler"
  type        = string
  default     = "apache/arrow-ballista-scheduler"
}

variable "executor_image" {
  description = "Container image for Ballista executor"
  type        = string
  default     = "apache/arrow-ballista-executor"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
