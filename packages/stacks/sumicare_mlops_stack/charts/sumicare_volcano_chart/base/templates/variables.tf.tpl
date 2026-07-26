/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for Volcano"
  type        = string
  default     = "volcano-system"
}

variable "volcano_version" {
  description = "Version of Volcano"
  type        = string
  default     = "{{ Version "volcano" }}"
}

variable "image" {
  description = "Container image for Volcano controller manager"
  type        = string
  default     = "docker.io/volcanosh/vc-controller-manager"
}

variable "webhook_image" {
  description = "Container image for Volcano webhook manager"
  type        = string
  default     = "docker.io/volcanosh/vc-webhook-manager"
}

variable "scheduler_image" {
  description = "Container image for Volcano scheduler"
  type        = string
  default     = "docker.io/volcanosh/vc-scheduler"
}

variable "agent_image" {
  description = "Container image for Volcano agent"
  type        = string
  default     = "docker.io/volcanosh/vc-agent"
}

variable "kube_state_metrics_image" {
  description = "Container image for kube-state-metrics"
  type        = string
  default     = "docker.io/volcanosh/kube-state-metrics"
}

variable "kube_state_metrics_version" {
  description = "Version of kube-state-metrics"
  type        = string
  default     = "v2.0.0-beta"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
