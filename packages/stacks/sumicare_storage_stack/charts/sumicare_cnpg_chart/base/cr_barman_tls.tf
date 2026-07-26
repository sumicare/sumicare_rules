resource "kubernetes_manifest" "certificate_barman_cloud_barman_cloud_client" {
  manifest = {
    "apiVersion" = "cert-manager.io/v1"
    "kind"       = "Certificate"
    "metadata" = {
      "name"      = "barman-cloud-client"
      "namespace" = "barman-cloud"
    }
    "spec" = {
      "commonName" = "barman-cloud-client"
      "duration"   = "2160h"
      "isCA"       = false
      "issuerRef" = {
        "group" = "cert-manager.io"
        "kind"  = "Issuer"
        "name"  = "plugin-barman-cloud-selfsigned-issuer"
      }
      "privateKey" = {
        "rotationPolicy" = "Always"
      }
      "renewBefore" = "360h"
      "secretName"  = "barman-cloud-client-tls"
      "usages" = [
        "client auth",
      ]
    }
  }
}

resource "kubernetes_manifest" "certificate_barman_cloud_barman_cloud_server" {
  manifest = {
    "apiVersion" = "cert-manager.io/v1"
    "kind"       = "Certificate"
    "metadata" = {
      "name"      = "barman-cloud-server"
      "namespace" = "barman-cloud"
    }
    "spec" = {
      "commonName" = "barman-cloud"
      "dnsNames" = [
        "barman-cloud",
      ]
      "duration" = "2160h"
      "isCA"     = false
      "issuerRef" = {
        "group" = "cert-manager.io"
        "kind"  = "Issuer"
        "name"  = "plugin-barman-cloud-selfsigned-issuer"
      }
      "privateKey" = {
        "rotationPolicy" = "Always"
      }
      "renewBefore" = "360h"
      "secretName"  = "barman-cloud-server-tls"
      "usages" = [
        "server auth",
      ]
    }
  }
}

resource "kubernetes_manifest" "issuer_barman_cloud_plugin_barman_cloud_selfsigned_issuer" {
  manifest = {
    "apiVersion" = "cert-manager.io/v1"
    "kind"       = "Issuer"
    "metadata" = {
      "name"      = "plugin-barman-cloud-selfsigned-issuer"
      "namespace" = "barman-cloud"
    }
    "spec" = {
      "selfSigned" = {}
    }
  }
}
