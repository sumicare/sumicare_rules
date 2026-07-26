/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceAccountNamed "prometheus_alertmanager" "" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "prometheus_kube_state_metrics" "" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "prometheus_prometheus_node_exporter" "" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "prometheus_prometheus_pushgateway" "" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "prometheus_server" "" "var.namespace" }}
