/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceNamed "ballista_scheduler" "scheduler" "var.namespace" "local.scheduler_labels" "scheduler--TCP--50050--scheduler,scheduler-ui--TCP--80--scheduler-ui" "" "ClusterIP" }}

{{ KubernetesResourceServiceNamed "ballista_executor" "executor" "var.namespace" "local.executor_labels" "executor--TCP--50051--executor" "" "ClusterIP" }}
