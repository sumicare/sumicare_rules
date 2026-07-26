resource "kubernetes_manifest" "configmap_local_path_storage_local_path_config" {
  manifest = {
    "apiVersion" = "v1"
    "data" = {
      "config.json" = <<-EOT
      {
        "nodePathMap": [
          {
            "node": "DEFAULT_PATH_FOR_NON_LISTED_NODES",
            "paths": [
              "/opt/local-path-provisioner"
            ]
          }
        ]
      }
      EOT
      "helperPod.yaml" = <<-EOT
      apiVersion: v1
      kind: Pod
      metadata:
        name: helper-pod
        namespace: local-path-storage
        labels:
          app.kubernetes.io/name: local-path-provisioner
          helm.sh/chart: local-path-provisioner-0.0.34
          app.kubernetes.io/instance: local-path-storage
          app.kubernetes.io/version: "v0.0.34"
          app.kubernetes.io/managed-by: Helm
      spec:
        priorityClassName: system-node-critical
        tolerations:
          - key: node.kubernetes.io/disk-pressure
            operator: Exists
            effect: NoSchedule
        containers:
          - name: helper-pod
            image: busybox:latest
            imagePullPolicy: IfNotPresent
            resources:
              {}
      EOT
      "setup" = <<-EOT
      #!/bin/sh
      set -eu
      mkdir -m 0777 -p "$VOL_DIR"
      EOT
      "teardown" = <<-EOT
      #!/bin/sh
      set -eu
      rm -rf "$VOL_DIR"
      EOT
    }
    "kind" = "ConfigMap"
    "metadata" = {
      "labels" = {
        "app.kubernetes.io/instance" = "local-path-storage"
        "app.kubernetes.io/managed-by" = "Helm"
        "app.kubernetes.io/name" = "local-path-provisioner"
        "app.kubernetes.io/version" = "v0.0.34"
        "helm.sh/chart" = "local-path-provisioner-0.0.34"
      }
      "name" = "local-path-config"
      "namespace" = "local-path-storage"
    }
  }
}
