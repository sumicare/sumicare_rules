/**
   Copyright (c) 2026 Sumicare Contributors

   Licensed under the terms of MIT License
*/

###           DO NOT EDIT            ###
# This file is automagically generated #

resource "kubernetes_secret" "forgejo_inline_config" {
  metadata {
    name      = "${local.deployment_name}-inline-config"
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    _generals_ = "APP_NAME=\nRUN_MODE=prod"
    cache      = "ADAPTER=memory\nHOST="
    database   = "DB_TYPE=sqlite3"
    metrics    = "ENABLED=false"
    queue      = "CONN_STR=\nTYPE=level"
    repository = "ROOT=/data/git/gitea-repositories"
    security   = "INSTALL_LOCK=true"
    server     = "APP_DATA_PATH=/data\nDOMAIN=git.example.com\nENABLE_PPROF=false\nHTTP_PORT=3000\nPROTOCOL=http\nROOT_URL=http://git.example.com\nSSH_DOMAIN=git.example.com\nSSH_LISTEN_PORT=2222\nSSH_PORT=22\nSTART_SSH_SERVER=true"
    session    = "PROVIDER=memory\nPROVIDER_CONFIG="
  }

  type = "Opaque"
}

resource "kubernetes_secret" "forgejo" {
  metadata {
    name      = local.deployment_name
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    "config_environment.sh" = file("${path.module}/scripts/config_environment.sh")
  }

  type = "Opaque"
}

resource "kubernetes_secret" "forgejo_init" {
  metadata {
    name      = "${local.deployment_name}-init"
    namespace = var.namespace
    labels    = local.labels
  }

  data = {
    "configure_gitea.sh"           = file("${path.module}/scripts/configure_gitea.sh")
    "configure_gpg_environment.sh" = file("${path.module}/scripts/configure_gpg_environment.sh")
    "init_directory_structure.sh"  = file("${path.module}/scripts/init_directory_structure.sh")
  }

  type = "Opaque"
}
