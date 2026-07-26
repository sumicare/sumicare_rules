resource "kubernetes_service_account" "release_name_forgejo" {
  metadata {
    name      = "release-name-forgejo"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }
}

resource "kubernetes_secret" "release_name_forgejo_inline_config" {
  metadata {
    name      = "release-name-forgejo-inline-config"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
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

resource "kubernetes_secret" "release_name_forgejo" {
  metadata {
    name      = "release-name-forgejo"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }

  data = {
    "config_environment.sh" = "#!/usr/bin/env bash\nset -euo pipefail\n\nfunction env2ini::log() {\n  printf \"$${1}\\n\"\n}\n\nfunction env2ini::read_config_to_env() {\n  local section=\"$${1}\"\n  local line=\"$${2}\"\n\n  if [[ -z \"$${line}\" ]]; then\n    # skip empty line\n    return\n  fi\n\n  # 'xargs echo -n' trims all leading/trailing whitespaces and a trailing new line\n  local setting=\"$(awk -F '=' '{print $1}' <<< \"$${line}\" | xargs echo -n)\"\n\n  if [[ -z \"$${setting}\" ]]; then\n    env2ini::log '  ! invalid setting'\n    exit 1\n  fi\n\n  local value=''\n  local regex=\"^$${setting}(\\s*)=(\\s*)(.*)\"\n  if [[ $line =~ $regex ]]; then\n    value=\"$${BASH_REMATCH[3]}\"\n  else\n    env2ini::log '  ! invalid setting'\n    exit 1\n  fi\n\n  env2ini::log \"    + '$${setting}'\"\n\n  local masked_setting=\"$${setting//./_0X2E_}\"                           # '//' instructs to replace all matches\n  masked_setting=\"$${masked_setting//-/_0X2D_}\"\n\n  if [[ -z \"$${section}\" ]]; then\n    export \"FORGEJO____$${masked_setting^^}=$${value}\"                           # '^^' makes the variable content uppercase\n    return\n  fi\n\n  local masked_section=\"$${section//./_0X2E_}\"                           # '//' instructs to replace all matches\n  masked_section=\"$${masked_section//-/_0X2D_}\"\n\n  export \"FORGEJO__$${masked_section^^}__$${masked_setting^^}=$${value}\"          # '^^' makes the variable content uppercase\n}\n\nfunction env2ini::reload_preset_envs() {\n  env2ini::log \"Reloading preset envs...\"\n\n  while read -r line; do\n    if [[ -z \"$${line}\" ]]; then\n      # skip empty line\n      return\n    fi\n\n    # 'xargs echo -n' trims all leading/trailing whitespaces and a trailing new line\n    local setting=\"$(awk -F '=' '{print $1}' <<< \"$${line}\" | xargs echo -n)\"\n\n    if [[ -z \"$${setting}\" ]]; then\n      env2ini::log '  ! invalid setting'\n      exit 1\n    fi\n\n    local value=''\n    local regex=\"^$${setting}(\\s*)=(\\s*)(.*)\"\n    if [[ $line =~ $regex ]]; then\n      value=\"$${BASH_REMATCH[3]}\"\n    else\n      env2ini::log '  ! invalid setting'\n      exit 1\n    fi\n\n    env2ini::log \"  + '$${setting}'\"\n\n    export \"$${setting^^}=$${value}\"                           # '^^' makes the variable content uppercase\n  done < \"/tmp/existing-envs\"\n\n  rm /tmp/existing-envs\n}\n\n\nfunction env2ini::process_config_file() {\n  local config_file=\"$${1}\"\n  local section=\"$(basename \"$${config_file}\")\"\n\n  if [[ $section == '_generals_' ]]; then\n    env2ini::log \"  [ini root]\"\n    section=''\n  else\n    env2ini::log \"  $${section}\"\n  fi\n\n  while read -r line; do\n    env2ini::read_config_to_env \"$${section}\" \"$${line}\"\n  done < <(awk 1 \"$${config_file}\")                             # Helm .toYaml trims the trailing new line which breaks line processing; awk 1 ... adds it back while reading\n}\n\nfunction env2ini::load_config_sources() {\n  local path=\"$${1}\"\n\n  if [[ -d \"$${path}\" ]]; then\n    env2ini::log \"Processing $(basename \"$${path}\")...\"\n\n    while read -d '' configFile; do\n      env2ini::process_config_file \"$${configFile}\"\n    done < <(find \"$${path}\" -type l -not -name '..data' -print0)\n\n    env2ini::log \"\\n\"\n  fi\n}\n\nfunction env2ini::generate_initial_secrets() {\n  # These environment variables will either be\n  #   - overwritten with user defined values,\n  #   - initially used to set up Forgejo\n  # Anyway, they won't harm existing app.ini files\n\n  export FORGEJO__SECURITY__INTERNAL_TOKEN=$(gitea generate secret INTERNAL_TOKEN)\n  export FORGEJO__SECURITY__SECRET_KEY=$(gitea generate secret SECRET_KEY)\n  export FORGEJO__OAUTH2__JWT_SECRET=$(gitea generate secret JWT_SECRET)\n  export FORGEJO__SERVER__LFS_JWT_SECRET=$(gitea generate secret LFS_JWT_SECRET)\n\n  env2ini::log \"...Initial secrets generated\\n\"\n}\n\n# save existing envs prior to script execution. Necessary to keep order of\n# preexisting and custom envs\nenv | (grep -e '^FORGEJO__' || [[ $? == 1 ]]) > /tmp/existing-envs\n\n# MUST BE CALLED BEFORE OTHER CONFIGURATION\nenv2ini::generate_initial_secrets\n\nenv2ini::load_config_sources '/env-to-ini-mounts/inlines/'\nenv2ini::load_config_sources '/env-to-ini-mounts/additionals/'\n\n# load existing envs to override auto generated envs\nenv2ini::reload_preset_envs\n\nenv2ini::log \"=== All configuration sources loaded ===\\n\"\n\n# safety to prevent rewrite of secret keys if an app.ini already exists\nif [ -f $${GITEA_APP_INI} ]; then\n  env2ini::log 'An app.ini file already exists. To prevent overwriting secret keys, these settings are dropped and remain unchanged:'\n  env2ini::log '  - security.INTERNAL_TOKEN'\n  env2ini::log '  - security.SECRET_KEY'\n  env2ini::log '  - oauth2.JWT_SECRET'\n  env2ini::log '  - server.LFS_JWT_SECRET'\n\n  unset FORGEJO__SECURITY__INTERNAL_TOKEN\n  unset FORGEJO__SECURITY__SECRET_KEY\n  unset FORGEJO__OAUTH2__JWT_SECRET\n  unset FORGEJO__SERVER__LFS_JWT_SECRET\nfi\n\nenvironment-to-ini -o $GITEA_APP_INI"
  }

  type = "Opaque"
}

resource "kubernetes_secret" "release_name_forgejo_init" {
  metadata {
    name      = "release-name-forgejo-init"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }

  data = {
    "configure_gitea.sh"           = "#!/usr/bin/env bash\n\nset -euo pipefail\n\necho '==== BEGIN GITEA CONFIGURATION ===='\n\n{ # try\n  gitea migrate\n} || { # catch\n  echo \"Forgejo migrate might fail due to database connection...This init-container will try again in a few seconds\"\n  exit 1\n}\n\nfunction configure_ldap() {\n    echo 'no ldap configuration... skipping.'\n}\n\nconfigure_ldap\n\nfunction configure_oauth() {\n    echo 'no oauth configuration... skipping.'\n}\n\nconfigure_oauth\n\necho '==== END GITEA CONFIGURATION ===='"
    "configure_gpg_environment.sh" = "#!/usr/bin/env bash\nset -eu\n\ngpg --batch --import /raw/private.asc"
    "init_directory_structure.sh"  = "#!/usr/bin/env bash\n\nset -euo pipefail\n\nset -x\nmkdir -p /data/git/.ssh\nchmod -R 700 /data/git/.ssh\n[ ! -d /data/gitea/conf ] && mkdir -p /data/gitea/conf\n\n# prepare temp directory structure\nmkdir -p \"$${GITEA_TEMP}\"\nchmod ug+rwx \"$${GITEA_TEMP}\""
  }

  type = "Opaque"
}

resource "kubernetes_persistent_volume_claim" "gitea_shared_storage" {
  metadata {
    name      = "gitea-shared-storage"
    namespace = "forgejo"

    annotations = {
      "helm.sh/resource-policy" = "keep"
    }
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "10Gi"
      }
    }

    volume_mode = "Filesystem"
  }
}

resource "kubernetes_service" "release_name_forgejo_http" {
  metadata {
    name      = "release-name-forgejo-http"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }

  spec {
    port {
      name        = "http"
      port        = 3000
      target_port = "http"
    }

    selector = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "forgejo"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_service" "release_name_forgejo_ssh" {
  metadata {
    name      = "release-name-forgejo-ssh"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }

  spec {
    port {
      name        = "ssh"
      protocol    = "TCP"
      port        = 22
      target_port = "ssh"
    }

    selector = {
      "app.kubernetes.io/instance" = "release-name"
      "app.kubernetes.io/name"     = "forgejo"
    }

    type = "ClusterIP"
  }
}

resource "kubernetes_deployment" "release_name_forgejo" {
  metadata {
    name      = "release-name-forgejo"
    namespace = "forgejo"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        "app.kubernetes.io/instance" = "release-name"
        "app.kubernetes.io/name"     = "forgejo"
      }
    }

    template {
      metadata {
        labels = {
          app                            = "forgejo"
          "app.kubernetes.io/instance"   = "release-name"
          "app.kubernetes.io/managed-by" = "Helm"
          "app.kubernetes.io/name"       = "forgejo"
          "app.kubernetes.io/version"    = "14.0.2"
          "helm.sh/chart"                = "forgejo-16.2.0"
          version                        = "14.0.2"
        }

        annotations = {
          "checksum/config" = "9963975dd848b3dd449406354210078a408953527c09d74de16e0ebbd4323e12"
        }
      }

      spec {
        volume {
          name = "init"

          secret {
            secret_name  = "release-name-forgejo-init"
            default_mode = "0156"
          }
        }

        volume {
          name = "config"

          secret {
            secret_name  = "release-name-forgejo"
            default_mode = "0156"
          }
        }

        volume {
          name = "inline-config-sources"

          secret {
            secret_name = "release-name-forgejo-inline-config"
          }
        }

        volume {
          name      = "temp"
          empty_dir = {}
        }

        volume {
          name = "data"

          persistent_volume_claim {
            claim_name = "gitea-shared-storage"
          }
        }

        init_container {
          name    = "init-directories"
          image   = "code.forgejo.org/forgejo/forgejo:14.0.2-rootless"
          command = ["/usr/sbin/init_directory_structure.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "init"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            run_as_user               = 1000
            run_as_non_root           = true
            read_only_root_filesystem = true

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        init_container {
          name    = "init-app-ini"
          image   = "code.forgejo.org/forgejo/forgejo:14.0.2-rootless"
          command = ["/usr/sbin/config_environment.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "config"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          volume_mount {
            name       = "inline-config-sources"
            mount_path = "/env-to-ini-mounts/inlines/"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            run_as_user               = 1000
            run_as_non_root           = true
            read_only_root_filesystem = true

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        init_container {
          name    = "configure-gitea"
          image   = "code.forgejo.org/forgejo/forgejo:14.0.2-rootless"
          command = ["/usr/sbin/configure_gitea.sh"]

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          env {
            name  = "HOME"
            value = "/data/gitea/git"
          }

          resources {
            requests = {
              cpu    = "100m"
              memory = "128Mi"
            }
          }

          volume_mount {
            name       = "init"
            mount_path = "/usr/sbin"
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            run_as_user               = 1000
            run_as_non_root           = true
            read_only_root_filesystem = true

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        container {
          name  = "forgejo"
          image = "code.forgejo.org/forgejo/forgejo:14.0.2-rootless"

          port {
            name           = "ssh"
            container_port = 2222
          }

          port {
            name           = "http"
            container_port = 3000
          }

          env {
            name  = "SSH_LISTEN_PORT"
            value = "2222"
          }

          env {
            name  = "SSH_PORT"
            value = "22"
          }

          env {
            name  = "GITEA_APP_INI"
            value = "/data/gitea/conf/app.ini"
          }

          env {
            name  = "GITEA_CUSTOM"
            value = "/data/gitea"
          }

          env {
            name  = "GITEA_WORK_DIR"
            value = "/data"
          }

          env {
            name  = "GITEA_TEMP"
            value = "/tmp/gitea"
          }

          env {
            name  = "TMPDIR"
            value = "/tmp/gitea"
          }

          env {
            name  = "HOME"
            value = "/data/gitea/git"
          }

          resources {
            limits = {
              cpu    = "1"
              memory = "2Gi"
            }

            requests = {
              cpu    = "100m"
              memory = "512Mi"
            }
          }

          volume_mount {
            name       = "temp"
            mount_path = "/tmp"
          }

          volume_mount {
            name       = "data"
            mount_path = "/data"
          }

          liveness_probe {
            tcp_socket {
              port = "http"
            }

            initial_delay_seconds = 200
            timeout_seconds       = 1
            period_seconds        = 10
            success_threshold     = 1
            failure_threshold     = 10
          }

          readiness_probe {
            http_get {
              path = "/api/healthz"
              port = "http"
            }

            initial_delay_seconds = 5
            timeout_seconds       = 1
            period_seconds        = 10
            success_threshold     = 1
            failure_threshold     = 3
          }

          image_pull_policy = "IfNotPresent"

          security_context {
            capabilities {
              drop = ["ALL"]
            }

            run_as_user               = 1000
            run_as_non_root           = true
            read_only_root_filesystem = true

            seccomp_profile {
              type = "RuntimeDefault"
            }
          }
        }

        termination_grace_period_seconds = 60
        dns_policy                       = "ClusterFirst"
        service_account_name             = "release-name-forgejo"

        security_context {
          fs_group = 1000
        }

        priority_class_name = "system-cluster-critical"
      }
    }

    strategy {
      type = "Recreate"
    }
  }
}

resource "kubernetes_pod" "release_name_forgejo_test_connection" {
  metadata {
    name = "release-name-forgejo-test-connection"

    labels = {
      app                            = "forgejo"
      "app.kubernetes.io/instance"   = "release-name"
      "app.kubernetes.io/managed-by" = "Helm"
      "app.kubernetes.io/name"       = "forgejo"
      "app.kubernetes.io/version"    = "14.0.2"
      "helm.sh/chart"                = "forgejo-16.2.0"
      version                        = "14.0.2"
    }

    annotations = {
      "helm.sh/hook" = "test"
    }
  }

  spec {
    container {
      name    = "wget"
      image   = "busybox:latest"
      command = ["wget"]
      args    = ["release-name-forgejo-http:3000"]
    }

    restart_policy = "Never"
  }
}

