/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for KubeArmor"
  type        = string
  default     = "kubearmor"
}

variable "kubearmor_version" {
  description = "Version of KubeArmor"
  type        = string
  default     = "{{ Version "kubearmor" }}"
}

variable "image" {
  description = "Container image for KubeArmor"
  type        = string
  default     = "kubearmor/kubearmor-operator"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
