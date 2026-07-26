/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceAccountNamed "kubearmor" "" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kubearmor_controller" "controller" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kubearmor_relay" "relay" "var.namespace" }}
