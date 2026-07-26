/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_config_map" "release_name_alloy" {
  metadata {
    name      = "release-name-alloy"
    namespace = "alloy"

    labels = {
      "app.kubernetes.io/component"  = "config"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/name"       = "alloy"
      "app.kubernetes.io/part-of"    = "alloy"
      "app.kubernetes.io/version"    = "v1.11.3"
    }
  }

  data = {
    "config.alloy" = "logging {\n\tlevel  = \"info\"\n\tformat = \"logfmt\"\n}\n\ndiscovery.kubernetes \"pods\" {\n\trole = \"pod\"\n}\n\ndiscovery.kubernetes \"nodes\" {\n\trole = \"node\"\n}\n\ndiscovery.kubernetes \"services\" {\n\trole = \"service\"\n}\n\ndiscovery.kubernetes \"endpoints\" {\n\trole = \"endpoints\"\n}\n\ndiscovery.kubernetes \"endpointslices\" {\n\trole = \"endpointslice\"\n}\n\ndiscovery.kubernetes \"ingresses\" {\n\trole = \"ingress\"\n}"
  }
}

