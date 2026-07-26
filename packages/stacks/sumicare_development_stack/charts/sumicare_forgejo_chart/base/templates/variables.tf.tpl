/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ OpenTofuVariablesChart }}

variable "forgejo_version" {
  description = "Version of Forgejo"
  type        = string
  default     = "{{ Version "forgejo" }}"
}
