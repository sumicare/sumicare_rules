/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for KubeRay"
  type        = string
  default     = "ray-system"
}

variable "kuberay_version" {
  description = "Version of KubeRay"
  type        = string
  default     = "{{ Version "kuberay" }}"
}

variable "image" {
  description = "Container image for KubeRay"
  type        = string
  default     = "quay.io/kuberay/operator"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
