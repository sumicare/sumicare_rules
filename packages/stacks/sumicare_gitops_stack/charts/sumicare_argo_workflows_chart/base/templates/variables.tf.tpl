/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for Argo Workflows"
  type        = string
  default     = "argo-workflows"
}

variable "argo_workflows_version" {
  description = "Version of Argo Workflows"
  type        = string
  default     = "{{ Version "argo-workflows" }}"
}

variable "controller_image" {
  description = "Container image for Argo Workflows controller"
  type        = string
  default     = "quay.io/argoproj/workflow-controller"
}

variable "controller_replicas" {
  description = "Number of replicas for controller"
  type        = number
  default     = 1
}

variable "server_image" {
  description = "Container image for Argo Workflows server"
  type        = string
  default     = "quay.io/argoproj/argocli"
}

variable "server_replicas" {
  description = "Number of replicas for server"
  type        = number
  default     = 1
}

variable "executor_image" {
  description = "Container image for Argo Workflows executor"
  type        = string
  default     = "quay.io/argoproj/argoexec"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
