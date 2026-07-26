/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceNamed "forgejo_http" "http" "var.namespace" "local.selector_labels" "http--TCP--3000--http" "" "ClusterIP" }}

{{ KubernetesResourceServiceNamed "forgejo_ssh" "ssh" "var.namespace" "local.selector_labels" "ssh--TCP--22--ssh" "" "ClusterIP" }}
