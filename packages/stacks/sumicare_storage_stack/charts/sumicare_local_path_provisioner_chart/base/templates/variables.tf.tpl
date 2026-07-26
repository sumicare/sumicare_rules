/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Local Path Provisioner"
  type        = string
  default     = "local-path-storage"
}

variable "local_path_provisioner_version" {
  description = "Version of Local Path Provisioner"
  type        = string
  default     = "{{ Version "local-path-provisioner" }}"
}

variable "image" {
  description = "Container image for Local Path Provisioner"
  type        = string
  default     = "rancher/local-path-provisioner"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
