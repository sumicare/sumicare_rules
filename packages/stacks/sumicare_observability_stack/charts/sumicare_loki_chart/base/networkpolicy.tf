/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

resource "kubernetes_network_policy" "loki_namespace_only" {
  metadata {
    name      = "loki-namespace-only"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  spec {
    pod_selector {}

    ingress {}

    egress {}

    policy_types = ["Ingress", "Egress"]
  }
}

resource "kubernetes_network_policy" "loki_egress_dns" {
  metadata {
    name      = "loki-egress-dns"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" = "${var.org}-${var.env}"
        "app.kubernetes.io/name"     = "loki"
      }
    }

    egress {
      ports {
        protocol = "UDP"
        port     = "53"
      }

      ports {
        protocol = "TCP"
        port     = "53"
      }
    }

    policy_types = ["Egress"]
  }
}

resource "kubernetes_network_policy" "loki_ingress" {
  metadata {
    name      = "loki-ingress"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" = "${var.org}-${var.env}"
        "app.kubernetes.io/name"     = "loki"
      }

      match_expressions {
        key      = "app.kubernetes.io/component"
        operator = "In"
        values   = ["gateway"]
      }
    }

    ingress {
      ports {
        protocol = "TCP"
        port     = "http-metrics"
      }
    }

    policy_types = ["Ingress"]
  }
}

resource "kubernetes_network_policy" "loki_ingress_metrics" {
  metadata {
    name      = "loki-ingress-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/instance" = "${var.org}-${var.env}"
        "app.kubernetes.io/name"     = "loki"
      }
    }

    ingress {
      ports {
        protocol = "TCP"
        port     = "http-metrics"
      }
    }

    policy_types = ["Ingress"]
  }
}

resource "kubernetes_network_policy" "loki_egress_alertmanager" {
  metadata {
    name      = "loki-egress-alertmanager"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/instance" = "${var.org}-${var.env}"
      "app.kubernetes.io/name"     = "loki"
      "app.kubernetes.io/version"  = "3.5.7"
    }
  }

  spec {
    pod_selector {
      match_labels = {
        "app.kubernetes.io/component" = "backend"
        "app.kubernetes.io/instance"  = "${var.org}-${var.env}"
        "app.kubernetes.io/name"      = "loki"
      }
    }

    egress {
      ports {
        protocol = "TCP"
        port     = "9093"
      }
    }

    policy_types = ["Egress"]
  }
}

