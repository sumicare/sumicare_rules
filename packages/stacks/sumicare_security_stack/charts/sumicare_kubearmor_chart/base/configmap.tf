resource "kubernetes_manifest" "configmap_kubearmor_kubearmor_config" {
  manifest = {
    "apiVersion" = "v1"
    "kind" = "ConfigMap"
    "metadata" = {
      "labels" = {
        "kubearmor-app" = "kubearmor-configmap"
      }
      "name" = "kubearmor-config"
      "namespace" = "kubearmor"
    }
  }
}
