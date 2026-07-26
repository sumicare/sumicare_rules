/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

{{ OpenTofuVariableReplicas }}

variable "namespace" {
  description = "Kubernetes namespace for ExternalDNS"
  type        = string
  default     = "external-dns"
}

variable "external_dns_version" {
  description = "Version of ExternalDNS"
  type        = string
  default     = "{{ Version "external-dns" }}"
}

variable "image" {
  description = "Container image for ExternalDNS"
  type        = string
  default     = "registry.k8s.io/external-dns/external-dns"
}

{{ OpenTofuVariableRevisionHistoryLimit }}
