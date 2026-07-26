/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "namespace" {
  description = "Kubernetes namespace for ArgoCD"
  type        = string
  default     = "argocd"
}

variable "argocd_image" {
  description = "ArgoCD container image repository"
  type        = string
  default     = "quay.io/argoproj/argocd"
}

variable "argocd_version" {
  description = "Version of ArgoCD"
  type        = string
  default     = "{{ Version "argocd" }}"
}

variable "application_controller_replicas" {
  description = "Number of replicas for application controller"
  type        = number
  default     = 3
}

variable "applicationset_controller_replicas" {
  description = "Number of replicas for applicationset controller"
  type        = number
  default     = 3
}

variable "notifications_controller_replicas" {
  description = "Number of replicas for notifications controller"
  type        = number
  default     = 1
}

variable "repo_server_replicas" {
  description = "Number of replicas for repo server"
  type        = number
  default     = 3
}

variable "server_replicas" {
  description = "Number of replicas for server"
  type        = number
  default     = 3
}

variable "dex_server_replicas" {
  description = "Number of replicas for dex server"
  type        = number
  default     = 1
}
