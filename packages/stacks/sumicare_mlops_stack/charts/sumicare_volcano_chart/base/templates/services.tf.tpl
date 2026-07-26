/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

{{ GeneratedComment }}

resource "kubernetes_service" "release_name_admission_service" {
  metadata {
    name      = "release-name-admission-service"
    namespace = var.namespace

    labels = {
      app = "volcano-admission"
    }
  }

  spec {
    port {
      protocol    = "TCP"
      port        = 443
      target_port = "8443"
    }

    selector = {
      app = "volcano-admission"
    }

    session_affinity = "None"
  }
}

resource "kubernetes_service" "release_name_controllers_service" {
  metadata {
    name      = "release-name-controllers-service"
    namespace = var.namespace

    labels = {
      app = "volcano-controller"
    }

    annotations = {
      "prometheus.io/path"   = "/metrics"
      "prometheus.io/port"   = "8081"
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8081
      target_port = "8081"
    }

    selector = {
      app = "volcano-controller"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "grafana" {
  metadata {
    name      = "grafana"
    namespace = var.namespace

    annotations = {
      "prometheus.io/port"   = "3000"
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      port        = 3000
      target_port = "3000"
      node_port   = 30004
    }

    selector = {
      app = "grafana"
    }

    type = "NodePort"
  }
}

resource "kubernetes_service" "kube_state_metrics" {
  metadata {
    name      = "kube-state-metrics"
    namespace = var.namespace

    labels = {
      "app.kubernetes.io/name" = "kube-state-metrics"
    }

    annotations = {
      "prometheus.io/path"   = "/metrics"
      "prometheus.io/port"   = "8080"
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      name        = "http-metrics"
      port        = 8080
      target_port = "http-metrics"
    }

    port {
      name        = "telemetry"
      port        = 8081
      target_port = "telemetry"
    }

    selector = {
      k8s-app = "kube-state-metrics"
    }
  }
}

resource "kubernetes_service" "prometheus_service" {
  metadata {
    name      = "prometheus-service"
    namespace = var.namespace

    annotations = {
      "prometheus.io/port"   = "9090"
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      port        = 8080
      target_port = "9090"
      node_port   = 30003
    }

    selector = {
      app = "prometheus-server"
    }

    type = "NodePort"
  }
}

resource "kubernetes_service" "release_name_scheduler_service" {
  metadata {
    name      = "release-name-scheduler-service"
    namespace = var.namespace

    labels = {
      app = "volcano-scheduler"
    }

    annotations = {
      "prometheus.io/path"   = "/metrics"
      "prometheus.io/port"   = "8080"
      "prometheus.io/scrape" = "true"
    }
  }

  spec {
    port {
      name        = "metrics"
      protocol    = "TCP"
      port        = 8080
      target_port = "8080"
    }

    selector = {
      app = "volcano-scheduler"
    }

    type = "ClusterIP"
  }
}
