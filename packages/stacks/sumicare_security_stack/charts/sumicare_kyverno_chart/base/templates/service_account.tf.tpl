/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

{{ KubernetesResourceServiceAccountNamed "kyverno_admission_controller" "admission-controller" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kyverno_background_controller" "background-controller" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kyverno_cleanup_controller" "cleanup-controller" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kyverno_reports_controller" "reports-controller" "var.namespace" }}

{{ KubernetesResourceServiceAccountNamed "kyverno_migrate_resources" "migrate-resources" "var.namespace" }}
