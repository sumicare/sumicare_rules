/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceNamed "ome_webhook_server_service" "webhook-server-service" "var.namespace" "local.controller_labels" "https--TCP--443--webhook-server" "" "ClusterIP" }}

{{ KubernetesResourceServiceNamed "ome_controller_manager_service" "controller-manager-service" "var.namespace" "local.controller_labels" "https--TCP--8443--https" "" "ClusterIP" }}
