/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceNamed "prometheus_alertmanager" "" "var.namespace" }}

{{ KubernetesResourceServiceNamed "prometheus_alertmanager_headless" "" "var.namespace" }}

{{ KubernetesResourceServiceNamed "prometheus_kube_state_metrics" "" "var.namespace" }}

{{ KubernetesResourceServiceNamed "prometheus_prometheus_node_exporter" "" "var.namespace" }}

{{ KubernetesResourceServiceNamed "prometheus_prometheus_pushgateway" "" "var.namespace" }}

{{ KubernetesResourceServiceNamed "prometheus_server" "" "var.namespace" }}
