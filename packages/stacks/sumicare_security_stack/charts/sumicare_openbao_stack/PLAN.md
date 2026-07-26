# PLAN.md — Refactor: Replace cert-manager + bank-vaults with OpenBao-only Stack

## Objective

Replace the cert-manager chart and the bank-vaults operator/reloader/webhook stack with a unified **OpenBao-only** stack composed of four CDK8s sub-charts:

1. **Server** — StatefulSet running the OpenBao secrets backend (`quay.io/openbao/openbao`)
2. **Secrets Injector** — Mutating webhook that injects OpenBao agents into pods (`openbao/openbao-k8s` agent-inject)
3. **CSI Provider** — DaemonSet for Secrets Store CSI driver integration (`openbao/openbao-csi-provider`)
4. **Snapshot Agent** — CronJob for periodic raft snapshots to S3 (`ghcr.io/openbao/openbao-snapshot-agent`)

This eliminates the need for:
- `bank-vaults` operator (Vault CRD controller)
- `bank-vaults` secrets-reloader (deployment watcher)
- `bank-vaults` secrets-webhook (mutating webhook for env-var mutation)
- `cert-manager` chart (controller, cainjector, webhook, CRDs)
- All Terraform `.tf` files in `base/` (bank-vaults Terraform stack — replaced by CDK8s)

OpenBao's injector replaces the bank-vaults secrets-webhook. OpenBao's CSI provider replaces the bank-vaults CSI functionality. The bank-vaults operator's Vault CRD is no longer needed — OpenBao server is configured directly via ConfigMap.

---

## Reference Source Code (`base/` Directory)

The `base/` directory contains upstream OpenBao project source code used as reference for building the CDK8s sub-charts. These are **not** deployed directly — they inform the CDK8s resource definitions.

### Terraform Files (bank-vaults — to be removed)

| File | Purpose | Action |
|---|---|---|
| `base/deployment_vault_operator.tf` | vault-operator Deployment | Delete — replaced by OpenBao server StatefulSet |
| `base/deployment_secrets_webhook.tf` | secrets-webhook Deployment | Delete — replaced by injector Deployment |
| `base/deployment_secrets_reloader.tf` | secrets-reloader Deployment | Delete — no equivalent needed |
| `base/cr_webhook_mutating.tf` | vault-secrets-webhook MutatingWebhookConfiguration | Delete — replaced by injector MutatingWebhookConfiguration |
| `base/rbac.tf` | ClusterRoles/Bindings for vault-operator, webhook, reloader | Delete — replaced by OpenBao RBAC |
| `base/service_account.tf` | ServiceAccounts for vault-operator, webhook, reloader | Delete — replaced by OpenBao SAs |
| `base/services.tf` | Services for vault-operator, reloader, webhook | Delete — replaced by OpenBao services |
| `base/secrets.tf` | TLS secret for vault-secrets-webhook | Delete — injector auto-generates TLS |
| `base/variables.tf` | Input variables for bank-vaults stack | Delete |
| `base/locals.tf` | Local variables (app name, labels) | Delete |
| `base/versions.tf` | Terraform/OpenTofu provider versions | Delete |
| `base/output.tf` | Outputs (empty) | Delete |
| `base/templates/` | Terraform template `.tpl` files | Delete |
| `base/render/main.go` | Terraform rendering helper | Delete |

### Go Source Directories (OpenBao upstream — keep as reference)

| Directory | Description | Key Reference Files |
|---|---|---|
| `base/openbao/` | Main OpenBao server source (Go) | `main.go`, `internal/vault/`, `sdk/` |
| `base/openbao-helm/` | Official OpenBao Helm chart | `charts/openbao/templates/` — all K8s manifest templates |
| `base/openbao-k8s/` | OpenBao Kubernetes integration (agent-inject) | `deploy/` — injector deployment/webhook/RBAC/service YAMLs; `agent-inject/` — Go source for mutation handler |
| `base/openbao-csi-provider/` | OpenBao CSI provider for Secrets Store CSI driver | `deployment/openbao-csi-provider.yaml` — full DaemonSet+RBAC manifest; `main.go` — gRPC server source |
| `base/openbao-snapshot-agent/` | OpenBao raft snapshot agent | `kubernetes/cronjob.yaml`, `kubernetes/serviceaccount.yaml`, `kubernetes/bao-snapshot.sh` |
| `base/openbao-plugins/` | OpenBao auth/secrets/database/KMS plugins | `auth/`, `secrets/`, `database/`, `kms/` — plugin source code |
| `base/go-kms-wrapping/` | Go KMS wrapping library (auto-unseal) | `wrappers/` — KMS provider implementations |

---

## Current Architecture (to be removed)

### cert-manager chart (`sumicare_cert_manager_chart/`)
- **Components**: controller, cainjector, webhook, startupApiCheck
- **CRDs**: Certificate, CertificateRequest, Challenge, Order, ClusterIssuer, Issuer
- **Purpose**: TLS certificate provisioning for webhooks across all stacks
- **Consumers** (outside security stack):
  - `sumicare_kamaji_controller_chart` — `CertManagerCertificate` + `CertManagerIssuer` (self-signed issuer for webhook serving cert)
  - `sumicare_descheduler_chart` — `CertManagerCertificate` + `CertManagerClusterIssuer` (Vault/OpenBao PKI-backed issuer for metrics TLS)
  - `sumicare_goldilocks_dashboard_chart` — `CertManagerCertificate` + `CertManagerClusterIssuer` (Vault/OpenBao PKI-backed issuer for dashboard TLS)

### bank-vaults stack (`sumicare_bank_vaults_stack/`)
- **Components**: vault-operator, secrets-reloader, secrets-webhook
- **CRD**: Vault (`vault.banzaicloud.com/v1alpha1`)
- **Purpose**: Operate Vault instances, mutate env-vars, reload deployments on secret changes
- **Terraform**: `base/*.tf` files define the same resources as CDK8s (Deployments, Services, RBAC, MutatingWebhook, TLS Secret)
- **Current CDK8s structure**:
  - `src/BankVaultsStack.ts` — composes `OpenbaoChart` + `BankVaultsChart`
  - `src/BankVaultsChart.ts` — operator/reloader/webhook Deployments, Services, MutatingWebhook, RBAC
  - `src/Config.ts` — bank-vaults config schema (operator, reloader, webhook)
  - `src/Resources/` — ClusterRole, Role, Deployment, Service, MutatingWebhook for bank-vaults components
  - `charts/sumicare_openbao_chart/` — existing OpenBao sub-chart (server StatefulSet, ConfigMap, services, RBAC)

### Security CRDs (`sumicare_security_crds/`)
- Contains CRD definitions for: cert-manager (6 kinds), vault-operator (1 kind), kubearmor (5), kyverno (11), falco (5)
- Exports typed constructs: `CertManagerCertificate`, `CertManagerClusterIssuer`, `CertManagerIssuer`, `CertManagerCertificateRequest`, `CertManagerChallenge`, `CertManagerOrder`, `VaultOperatorVault`
- `CrdSources.ts` defines upstream GitHub sources for each CRD kind

### SecurityStack.ts (`src/SecurityStack.ts`)
- Currently a passthrough chart (`z.object({}).passthrough()`) — does not compose any sub-charts yet
- Needs to be updated to compose the new `OpenbaoStack`

---

## Target Architecture (OpenBao-only)

### Unified OpenBao Stack with Sub-Charts

The stack is renamed from `sumicare_bank_vaults_stack` to `sumicare_openbao_stack` and restructured with four sub-charts, one per OpenBao component:

```
sumicare_openbao_stack/
├── package.json
├── tsconfig.json
├── rslib.config.ts
├── rstest.config.ts
├── src/
│   ├── OpenbaoStack.ts                    # Main stack chart (composes sub-charts)
│   ├── Config.ts                          # Unified Zod config schema
│   ├── Version.ts                          # Version resolver
│   ├── Resources/
│   │   ├── ClusterRole.ts                  # Cluster-scoped RBAC (server, injector, csi)
│   │   ├── Role.ts                         # Namespace-scoped RBAC (leader election, secrets)
│   │   └── NetworkPolicy.ts               # Network policies (server, injector)
│   ├── Resources.ts                       # Barrel exports
│   ├── CustomResources/
│   │   ├── ServiceMonitor.ts              # Prometheus ServiceMonitor CRs
│   │   ├── PrometheusRule.ts              # PrometheusRule CRs (alerting rules)
│   │   └── PodDisruptionBudget.ts         # PDBs for server + injector
│   ├── CustomResources.ts                 # Barrel exports
│   └── charts/
│       ├── sumicare_openbao_server/        # Sub-chart: OpenBao server
│       │   ├── package.json
│       │   ├── rslib.config.ts
│       │   ├── src/
│       │   │   ├── OpenbaoServerChart.ts
│       │   │   ├── Config.ts
│       │   │   ├── Version.ts
│       │   │   ├── Resources/
│       │   │   │   ├── StatefulSet.ts
│       │   │   │   ├── Service.ts          # ClusterIP, headless, HA-active
│       │   │   │   ├── ConfigMap.ts        # Server config JSON
│       │   │   │   └── ServiceAccount.ts   # Server SA + token secret
│       │   │   └── Resources.ts
│       │   └── test/
│       │       └── OpenbaoServerChartTest.ts
│       ├── sumicare_openbao_injector/      # Sub-chart: Secrets injector (agent-inject)
│       │   ├── package.json
│       │   ├── rslib.config.ts
│       │   ├── src/
│       │   │   ├── OpenbaoInjectorChart.ts
│       │   │   ├── Config.ts
│       │   │   ├── Version.ts
│       │   │   ├── Resources/
│       │   │   │   ├── Deployment.ts
│       │   │   │   ├── Service.ts
│       │   │   │   ├── MutatingWebhook.ts
│       │   │   │   └── ServiceAccount.ts   # Injector SA + TLS certs secret
│       │   │   └── Resources.ts
│       │   └── test/
│       │       └── OpenbaoInjectorChartTest.ts
│       ├── sumicare_openbao_csi/          # Sub-chart: CSI provider
│       │   ├── package.json
│       │   ├── rslib.config.ts
│       │   ├── src/
│       │   │   ├── OpenbaoCsiChart.ts
│       │   │   ├── Config.ts
│       │   │   ├── Version.ts
│       │   │   ├── Resources/
│       │   │   │   ├── DaemonSet.ts
│       │   │   │   ├── ConfigMap.ts        # CSI agent config (optional)
│       │   │   │   └── ServiceAccount.ts   # CSI provider SA
│       │   │   └── Resources.ts
│       │   └── test/
│       │       └── OpenbaoCsiChartTest.ts
│       └── sumicare_openbao_snapshot/     # Sub-chart: Snapshot agent
│           ├── package.json
│           ├── rslib.config.ts
│           ├── src/
│           │   ├── OpenbaoSnapshotChart.ts
│           │   ├── Config.ts
│           │   ├── Version.ts
│           │   ├── Resources/
│           │   │   ├── CronJob.ts
│           │   │   ├── ConfigMap.ts
│           │   │   └── ServiceAccount.ts
│           │   └── Resources.ts
│           └── test/
│               └── OpenbaoSnapshotChartTest.ts
├── test/
│   └── OpenbaoStackTest.ts
└── base/                                  # Keep existing base/ for reference
```

### Component Mapping

| Old (bank-vaults + cert-manager) | New (OpenBao) | Reference Source |
|---|---|---|
| vault-operator Deployment | OpenBao Server StatefulSet | `openbao-helm/templates/server-statefulset.yaml` |
| vault-operator RBAC (ClusterRole) | Server ClusterRole | `openbao-helm/templates/server-clusterrole.yaml` |
| vault-operator RBAC (Role) | Server leader-election Role | `openbao-helm/templates/server-discovery-role.yaml` |
| vault-operator Service | Server ClusterIP + Headless + HA-active | `openbao-helm/templates/server-{,headless-,ha-active-}service.yaml` |
| secrets-webhook Deployment | Injector Deployment | `openbao-helm/templates/injector-deployment.yaml`, `openbao-k8s/deploy/injector-deployment.yaml` |
| secrets-webhook MutatingWebhook | Injector MutatingWebhookConfiguration | `openbao-helm/templates/injector-mutating-webhook.yaml`, `openbao-k8s/deploy/injector-mutating-webhook.yaml` |
| secrets-webhook RBAC (ClusterRole) | Injector ClusterRole | `openbao-helm/templates/injector-clusterrole.yaml`, `openbao-k8s/deploy/injector-rbac.yaml` |
| secrets-webhook RBAC (Role) | Injector Role | `openbao-helm/templates/injector-role.yaml`, `openbao-k8s/deploy/injector-rbac.yaml` |
| secrets-webhook Service | Injector Service | `openbao-helm/templates/injector-service.yaml`, `openbao-k8s/deploy/injector-service.yaml` |
| secrets-webhook TLS Secret | Injector auto-generated TLS (`AGENT_INJECT_TLS_AUTO`) | `openbao-k8s/deploy/injector-leader-extras.yaml` |
| secrets-reloader Deployment | *(removed — OpenBao agent handles reload)* | N/A |
| cert-manager controller | *(removed — injector auto-generates TLS)* | N/A |
| cert-manager cainjector | *(removed)* | N/A |
| cert-manager webhook | *(removed)* | N/A |
| cert-manager CRDs (6) | *(removed)* | N/A |
| Vault CRD (`vault.banzaicloud.com`) | *(removed — no operator needed)* | N/A |
| *(new)* CSI Provider DaemonSet | `openbao-helm/templates/csi-daemonset.yaml`, `openbao-csi-provider/deployment/openbao-csi-provider.yaml` |
| *(new)* CSI Provider RBAC | `openbao-helm/templates/csi-{cluster,}role{,binding}.yaml` |
| *(new)* Snapshot Agent CronJob | `openbao-helm/templates/snapshotagent-cronjob.yaml`, `openbao-snapshot-agent/kubernetes/cronjob.yaml` |
| *(new)* Snapshot Agent SA | `openbao-helm/templates/snapshotagent-serviceaccount.yaml`, `openbao-snapshot-agent/kubernetes/serviceaccount.yaml` |
| *(new)* Network Policies | `openbao-helm/templates/{server,injector}-network-policy.yaml` |
| *(new)* PodDisruptionBudgets | `openbao-helm/templates/{server,injector}-disruptionbudget.yaml` |
| *(new)* Prometheus ServiceMonitor | `openbao-helm/templates/prometheus-servicemonitor.yaml` |
| *(new)* PrometheusRule | `openbao-helm/templates/prometheus-prometheusrules.yaml` |

---

## RBAC Design (cert-manager convention)

Following the established pattern from `sumicare_cert_manager_chart` and the existing `sumicare_openbao_chart`:

- **ClusterRole.ts** — `defineRbac<"server" | "injector" | "csi">` with cluster-scoped roles, creates all ServiceAccounts
- **Role.ts** — `defineRbac<"server" | "injector" | "csi">` with `scope: "namespace"` roles, receives pre-existing ServiceAccounts

### Cluster Roles

**`openbao-server`** (bound to `server` SA):
- `secrets` — get, list, watch, create, update
- `configMaps` — get, list, watch
- `pods` — get, list, watch
- `services` — get, list, watch, create, update, delete
- `events` — create, patch
- `customresourcedefinitions` — get

**`openbao-injector`** (bound to `injector` SA):
- `mutatingwebhookconfigurations` — get, list, watch, patch
- `nodes` — get

**`openbao-csi-provider`** (bound to `csi` SA):
- `serviceaccounts/token` — create

### Namespace Roles

**`openbao-server:leaderelection`** (bound to `server` SA):
- `leases` — get, update, patch (resourceName: `openbao-leader-election`)
- `leases` — create

**`openbao-injector`** (bound to `injector` SA):
- `secrets` — create, get, watch, list, update
- `configmaps` — create, get, watch, list, update
- `pods` — get, patch, delete
- `serviceaccounts` — get
- `serviceaccounts/token` — create

**`openbao-csi-provider`** (bound to `csi` SA):
- `secrets` — get (resourceName: `openbao-csi-provider-hmac-key`)
- `secrets` — create

---

## Detailed Sub-Chart Specifications

### Sub-Chart 1: `sumicare_openbao_server`

#### StatefulSet (`server-statefulset.yaml` reference)
- **Image**: `quay.io/openbao/openbao:<version>` (default v2.6.1)
- **Replicas**: 3 (HA mode, configurable)
- **Service**: headless `openbao-internal` for StatefulSet DNS
- **Ports**: 8200 (api), 8201 (cluster), 8202 (replication)
- **Env vars**:
  - `BAO_ADDR`, `BAO_API_ADDR`, `BAO_CLUSTER_ADDR`
  - `BAO_LOG_LEVEL`, `BAO_STORAGE`
  - `POD_NAME` (from downward API)
- **Probes**:
  - Readiness: `bao status` command exec
  - Liveness: HTTP GET `http://:8200/v1/sys/health`
- **Lifecycle**: preStop (`sleep 5 && kill -SIGTERM $(pidof bao)`)
- **Volumes**: config (ConfigMap), data (PVC with configurable storageClass/size)
- **Security**: `runAsNonRoot: true`, `runAsUser: 100`, `runAsGroup: 1000`, `fsGroup: 1000`
- **Pod management policy**: `OrderedReady`
- **Update strategy**: `RollingUpdate`

#### Services (3)
- **ClusterIP** (`openbao`): port 8200 (api), 8201 (cluster) — for client access
- **Headless** (`openbao-internal`): port 8200, 8201, `clusterIP: None` — for StatefulSet DNS
- **HA Active** (`openbao-active`): port 8200, selector `vault-active: true` — for active node

#### ConfigMap
- Server configuration JSON with:
  - Storage backend (integrated raft, file)
  - Listener (tcp with TLS or tls_disable)
  - HA/raft configuration
  - API address, cluster address

#### ServiceAccount
- ServiceAccount for server pods
- Optional ServiceAccount token Secret (for Kubernetes auth)

---

### Sub-Chart 2: `sumicare_openbao_injector`

#### Deployment (`injector-deployment.yaml` + `openbao-k8s/deploy/injector-deployment.yaml` reference)
- **Image**: `openbao/openbao-k8s:1.4.1` (injector binary)
- **Agent image**: `quay.io/openbao/openbao:<version>` (injected sidecar)
- **Replicas**: 2 (configurable, leader election)
- **Command**: `agent-inject`
- **Env vars** (from `openbao-k8s/deploy/injector-deployment.yaml`):
  - `AGENT_INJECT_LISTEN` — `:8080`
  - `AGENT_INJECT_LOG_LEVEL` — `info`
  - `AGENT_INJECT_LOG_FORMAT` — `standard`
  - `AGENT_INJECT_BAO_ADDR` — `https://openbao.$(NAMESPACE).svc:8200`
  - `AGENT_INJECT_BAO_IMAGE` — `openbao/openbao:<version>`
  - `AGENT_INJECT_TLS_AUTO` — `openbao-agent-injector-cfg` (webhook config name for TLS auto-generation)
  - `AGENT_INJECT_TLS_AUTO_HOSTS` — `openbao-agent-injector-svc,openbao-agent-injector-svc.$(NAMESPACE),openbao-agent-injector-svc.$(NAMESPACE).svc`
  - `AGENT_INJECT_USE_LEADER_ELECTOR` — `true`
  - `AGENT_INJECT_DEFAULT_TEMPLATE` — `map`
  - `AGENT_INJECT_CPU_REQUEST` — `250m`
  - `AGENT_INJECT_MEM_REQUEST` — `64Mi`
  - `AGENT_INJECT_CPU_LIMIT` — `500m`
  - `AGENT_INJECT_MEM_LIMIT` — `128Mi`
  - `NAMESPACE` — from downward API
  - `POD_NAME` — from downward API
- **Probes** (HTTPS):
  - Liveness: HTTP GET `https://:8080/health/ready`
  - Readiness: HTTP GET `https://:8080/health/ready`
- **TLS**: Auto-generated via `AGENT_INJECT_TLS_AUTO` — the injector creates its own CA and serving certificate from the MutatingWebhookConfiguration name. No cert-manager needed.

#### Service
- Name: `openbao-agent-injector-svc`
- Port: 443 → targetPort 8080
- Selector: `app.kubernetes.io/name: openbao-injector`

#### MutatingWebhookConfiguration (`injector-mutating-webhook.yaml` + `openbao-k8s/deploy/injector-mutating-webhook.yaml` reference)
- Name: `openbao-agent-injector-cfg`
- Webhook name: `openbao.org`
- Path: `/mutate`
- Service: `openbao-agent-injector-svc` (port 443)
- Rules: pods CREATE, apiGroups `[""]`, apiVersions `["v1"]`, resources `["pods"]`, scope `Namespaced`
- `namespaceSelector`: `{}` (all namespaces)
- `objectSelector`: `matchExpressions: [{key: app.kubernetes.io/name, operator: NotIn, values: ["openbao-injector"]}]` — exclude self
- `failurePolicy`: `Ignore` (configurable)
- `sideEffects`: `None`
- `admissionReviewVersions`: `["v1", "v1beta1"]`
- `caBundle`: `""` (auto-populated by `AGENT_INJECT_TLS_AUTO`)

#### ServiceAccount + TLS Secret
- ServiceAccount: `openbao-injector`
- Secret: `openbao-injector-certs` — used for leader election cleanup

---

### Sub-Chart 3: `sumicare_openbao_csi`

#### DaemonSet (`openbao-csi-provider/deployment/openbao-csi-provider.yaml` + `openbao-helm/templates/csi-daemonset.yaml` reference)
- **Image**: `openbao/openbao-csi-provider:2.0.2`
- **Namespace**: `csi` (configurable, separate from server namespace)
- **Node selector**: `kubernetes.io/os: linux`
- **Init container** (`prepare-provider-dir`):
  - Image: same as main
  - Command: `/bin/sh -ec "chown 1000:1000 /provider"`
  - `runAsUser: 0`, `capabilities: [CHOWN]`
  - VolumeMount: `providervol` → `/provider`
- **Main container** (`provider-openbao-installer`):
  - Args: `--endpoint=/provider/openbao.sock`, `--debug=false`, `--hmac-secret-name=openbao-csi-provider-hmac-key`
  - `runAsNonRoot: true`, `runAsUser: 1000`, `runAsGroup: 1000`
  - `readOnlyRootFilesystem: true`, `capabilities: [drop ALL]`
  - Resources: requests/limits `50m` CPU, `100Mi` memory
  - Probes: HTTP GET `http://:8080/health/ready` (liveness + readiness)
  - VolumeMount: `providervol` → `/provider`
- **Volume**: `providervol` — hostPath `/etc/kubernetes/secrets-store-csi-providers`
- **Update strategy**: `RollingUpdate`
- **Tolerations**: configurable

#### ConfigMap (optional, when `csi.agent.enabled`)
- CSI agent configuration `config.hcl`:
  - `vault { address = "..." }`
  - `listener { ... }`
- Based on `openbao-helm/templates/csi-agent-configmap.yaml`

#### ServiceAccount
- ServiceAccount: `openbao-csi-provider` (in `csi` namespace)

#### Prerequisites
- **Secrets Store CSI Driver** must be installed separately (not part of this stack)
- **SecretProviderClass CRD** must be available (see CRD Changes section)

---

### Sub-Chart 4: `sumicare_openbao_snapshot`

#### CronJob (`openbao-snapshot-agent/kubernetes/cronjob.yaml` + `openbao-helm/templates/snapshotagent-cronjob.yaml` reference)
- **Image**: `ghcr.io/openbao/openbao-snapshot-agent:0.3.0`
- **Schedule**: `0 * * * *` (configurable)
- **Env vars** (from ConfigMap):
  - `S3_HOST`, `S3_BUCKET`, `S3_URI`, `S3_EXPIRE_DAYS`, `S3CMD_EXTRA_FLAG`
  - `BAO_AUTH_PATH` (default: `kubernetes`)
  - `BAO_ROLE` (default: `bao-raft-snapshot`)
  - `BAO_ADDR` (OpenBao server URL)
- **Env vars** (from Secret):
  - `AWS_SECRET_ACCESS_KEY` — from `bao-snapshot-credentials` secret
  - `AWS_ACCESS_KEY_ID` — from `bao-snapshot-credentials` secret
- **Volume**: `snapshot-dir` — emptyDir for temporary snapshot files
- **Restart policy**: `Never`
- **automountServiceAccountToken**: `true`

#### ConfigMap
- Contains S3 configuration and OpenBao auth settings
- Based on `openbao-helm/templates/snapshotagent-configmap.yaml`

#### ServiceAccount
- ServiceAccount: `bao-snapshot`
- Based on `openbao-snapshot-agent/kubernetes/serviceaccount.yaml`

---

## Supporting Resources (at stack level)

### Network Policies (`openbao-helm/templates/{server,injector}-network-policy.yaml`)
- **Server NetworkPolicy**: ingress from injector + CSI, egress to API server
- **Injector NetworkPolicy**: ingress from API server (webhook calls), egress to server + API server

### PodDisruptionBudgets (`openbao-helm/templates/{server,injector}-disruptionbudget.yaml`)
- **Server PDB**: `minAvailable: 1` (for HA quorum)
- **Injector PDB**: `minAvailable: 1` (for webhook availability)

### Prometheus ServiceMonitor (`openbao-helm/templates/prometheus-servicemonitor.yaml`)
- ServiceMonitors for server (port 8200) and injector (port 8080)
- Conditional on `monitoring.serviceMonitors.enabled`

### PrometheusRule (`openbao-helm/templates/prometheus-prometheusrules.yaml`)
- Alerting rules for OpenBao health (sealed, unsealed, leader status)
- Conditional on `monitoring.prometheusRules.enabled`

---

## CRD Changes (`sumicare_security_crds/`)

### Remove cert-manager CRDs
- Delete CRD YAML files: `crds/crd-certmanager-*.yaml` (6 files)
- Remove from `CrdSources.ts`:
  - `challenges`, `orders`, `certificaterequests`, `certificates`, `clusterissuers`, `issuers` kinds
  - `certmanager` group definition
  - `certManager()` upstream source function
- Remove from `Crds.ts`:
  - `CertManagerCertificate`, `CertManagerCertificateSpec`
  - `CertManagerCertificateRequest`
  - `CertManagerChallenge`
  - `CertManagerClusterIssuer`, `CertManagerClusterIssuerSpec`, `CertManagerClusterIssuerVaultAuth`
  - `CertManagerIssuer`
  - `CertManagerOrder`
- Delete generated import files:
  - `imports/certificate-cert-manager.io.ts`
  - `imports/certificaterequest-cert-manager.io.ts`
  - `imports/challenge-acme.cert-manager.io.ts`
  - `imports/clusterissuer-cert-manager.io.ts`
  - `imports/issuer-cert-manager.io.ts`
  - `imports/order-acme.cert-manager.io.ts`

### Remove vault-operator CRD
- Delete `crds/crd-vault-operator-vaults.yaml`
- Remove from `CrdSources.ts`: `vaults` kind, `vaultoperator` group, `vaultOperator()` upstream function
- Remove from `Crds.ts`: `VaultOperatorVault` export
- Delete generated import: `imports/vault-vault.banzaicloud.com.ts`

### Add SecretProviderClass CRD
- The `SecretProviderClass` CRD is owned by the `secrets-store-csi-driver` project, not OpenBao
- If not already present in another CRD package, add it:
  - CRD file: `crds/crd-secrets-store-secretproviderclasses.yaml`
  - Upstream: `github.com/kubernetes-sigs/secrets-store-csi-driver`, path `deploy/crd`
  - Add to `CrdSources.ts` under a new `secretsstorecsi` group
  - Generate typed import: `imports/secretproviderclass-secrets-store.csi.x-k8s.io.ts`
  - Export from `Crds.ts`: `SecretProviderClass`

---

## Consumer Migration (compute stack)

### Charts that reference `@sumicare/stack-security-crds` for cert-manager:

#### 1. `sumicare_kamaji_controller_chart`
- **Current**: Uses `CertManagerIssuer` (self-signed) + `CertManagerCertificate` for webhook serving cert
- **File**: `src/CustomResources/Certificate.ts` — creates self-signed Issuer + Certificate for webhook TLS
- **Migration**: Replace with OpenBao PKI via CSI provider:
  - Create a `SecretProviderClass` that fetches a TLS cert from OpenBao's `pki/` secret engine
  - Mount the cert via CSI volume in the webhook pod
  - Remove `CertManagerIssuer` and `CertManagerCertificate` imports
  - Remove `@sumicare/stack-security-crds` dependency for cert-manager types
- **Alternative**: Use a Kubernetes Job that generates self-signed certs with `openssl` and stores them in a Secret

#### 2. `sumicare_descheduler_chart`
- **Current**: Uses `CertManagerClusterIssuer` (Vault/OpenBao PKI-backed) + `CertManagerCertificate` for metrics TLS
- **Files**:
  - `src/CustomResources/VaultIssuer.ts` — creates `CertManagerClusterIssuer` with Vault auth (Kubernetes SA, AppRole, or token)
  - `src/CustomResources/Certificate.ts` — creates `CertManagerCertificate` referencing the issuer
  - `src/Config.ts` — `CertificateSchema` and `VaultIssuerSchema` with issuerRef, dnsNames, auth config
- **Migration**: Replace with OpenBao CSI provider:
  - Create a `SecretProviderClass` that fetches TLS certs from OpenBao PKI
  - Use Kubernetes SA auth (the descheduler SA) to authenticate to OpenBao
  - Mount certs via CSI volume at the metrics endpoint
  - Remove `DeschedulerVaultIssuer` and `DeschedulerCertificate` classes
  - Remove `CertificateSchema` and `VaultIssuerSchema` from Config.ts
  - Add `SecretProviderClassSchema` to Config.ts

#### 3. `sumicare_goldilocks_dashboard_chart`
- **Current**: Same pattern as descheduler — `CertManagerClusterIssuer` + `CertManagerCertificate`
- **Files**:
  - `src/CustomResources/VaultIssuer.ts` — same pattern as descheduler
  - `src/CustomResources/Certificate.ts` — same pattern
  - `src/Config.ts` — `CertificateSchema` and `VaultIssuerSchema`
- **Migration**: Same approach as descheduler

### Migration phases:

**Phase 1** (with OpenBao stack PR):
- Keep cert-manager CRDs in `sumicare_security_crds` temporarily
- Deploy OpenBao stack alongside existing cert-manager + bank-vaults
- Verify OpenBao server, injector, CSI provider are functional

**Phase 2** (separate PR, after OpenBao stack is validated):
- Migrate `sumicare_kamaji_controller_chart` — replace cert-manager with CSI/SecretProviderClass
- Migrate `sumicare_descheduler_chart` — replace cert-manager with CSI/SecretProviderClass
- Migrate `sumicare_goldilocks_dashboard_chart` — replace cert-manager with CSI/SecretProviderClass

**Phase 3** (separate PR, after all consumers migrated):
- Remove cert-manager CRDs from `sumicare_security_crds`
- Remove cert-manager chart directory
- Remove vault-operator CRD from `sumicare_security_crds`
- Remove bank-vaults Terraform files from `base/`

---

## Config Schema Design

Unified `OpenbaoStackConfigSchema` with sections for each component:

```typescript
OpenbaoStackConfigSchema = z.object({
  name: z.string().default("openbao"),
  namespace: z.string().default("vault-system"),

  server: z.object({
    image: z.string().default("quay.io/openbao/openbao"),
    version: z.string().default(KnownLatestOpenbaoVersion),
    replicas: z.number().default(3),
    storage: z.object({
      size: z.string().default("10Gi"),
      storageClass: z.string().optional(),
    }),
    ha: z.object({
      enabled: z.boolean().default(true),
      replicas: z.number().default(3),
    }),
    probes: ProbeSchema.prefault({}),
    resources: ResourceSchema.prefault({}),
    serviceType: z.enum(["ClusterIP", "NodePort", "LoadBalancer"]).default("ClusterIP"),
    config: z.string().optional(),  // raw server config JSON override
  }),

  injector: z.object({
    enabled: z.boolean().default(true),
    image: z.string().default("openbao/openbao-k8s"),
    version: z.string().default("1.4.1"),
    agentImage: z.string().default("quay.io/openbao/openbao"),
    replicas: z.number().default(2),
    port: z.number().default(8080),
    logLevel: z.enum(["trace", "debug", "info", "warn", "error"]).default("info"),
    failurePolicy: z.enum(["Ignore", "Fail"]).default("Ignore"),
    resources: ResourceSchema.prefault({}),
    probes: ProbeSchema.prefault({}),
  }),

  csi: z.object({
    enabled: z.boolean().default(true),
    image: z.string().default("openbao/openbao-csi-provider"),
    version: z.string().default("2.0.2"),
    namespace: z.string().default("csi"),
    hmacSecretName: z.string().default("openbao-csi-provider-hmac-key"),
    agent: z.object({
      enabled: z.boolean().default(false),
      image: z.string().default("quay.io/openbao/openbao"),
    }),
    resources: ResourceSchema.prefault({}),
  }),

  snapshotAgent: z.object({
    enabled: z.boolean().default(false),
    image: z.string().default("ghcr.io/openbao/openbao-snapshot-agent"),
    version: z.string().default("0.3.0"),
    schedule: z.string().default("0 * * * *"),
    s3: z.object({
      host: z.string(),
      bucket: z.string(),
      uri: z.string(),
      expireDays: z.string().optional(),
      extraFlag: z.string().optional(),
    }),
    bao: z.object({
      addr: z.string().default("https://openbao.vault-system.svc:8200"),
      authPath: z.string().default("kubernetes"),
      role: z.string().default("bao-raft-snapshot"),
    }),
    credentialsSecret: z.string().default("bao-snapshot-credentials"),
  }),

  monitoring: z.object({
    serviceMonitors: z.object({
      enabled: z.boolean().default(false),
    }),
    prometheusRules: z.object({
      enabled: z.boolean().default(false),
    }),
  }),

  networkPolicy: z.object({
    enabled: z.boolean().default(false),
  }),

  // Common
  imagePullPolicy: z.enum(["Always", "IfNotPresent", "Never"]).default("IfNotPresent"),
  runAsUser: z.number().default(100),
  runAsGroup: z.number().default(1000),
  fsGroup: z.number().default(1000),
  revisionHistoryLimit: z.number().default(10),
})
```

---

## Version Sources

| Component | Image | Default Version | Upstream Repo |
|---|---|---|---|
| OpenBao server | `quay.io/openbao/openbao` | v2.6.1 | `github.com/openbao/openbao` |
| OpenBao Helm chart | N/A | 0.28.6 | `github.com/openbao/openbao-helm` |
| Injector (openbao-k8s) | `openbao/openbao-k8s` | 1.4.1 | `github.com/openbao/openbao-k8s` |
| CSI provider | `openbao/openbao-csi-provider` | 2.0.2 | `github.com/openbao/openbao-csi-provider` |
| Snapshot agent | `ghcr.io/openbao/openbao-snapshot-agent` | 0.3.0 | `github.com/openbao/openbao-snapshot-agent` |
| Agent image (injected) | `quay.io/openbao/openbao` | v2.6.1 | `github.com/openbao/openbao` |

---

## Detailed Steps

### Step 1: Rename + restructure
- Rename directory: `charts/sumicare_bank_vaults_stack/` → `charts/sumicare_openbao_stack/`
- Update `package.json`: name `@sumicare/stack-security-bank-vaults` → `@sumicare/stack-security-openbao`
- Update `tsconfig.json` path aliases: `Security/BankVaults/*` → `Security/Openbao/*`
- Update `rslib.config.ts`: entry `./src/OpenbaoStack.ts`
- Update `rstest.config.ts`: name `"openbao-stack"`
- Remove nested `charts/sumicare_openbao_chart/` (flatten into sub-charts)
- Remove `src/BankVaultsChart.ts`, `src/BankVaultsStack.ts`, `src/Config.ts` (old), `src/Version.ts` (old), `src/Resources/` (old), `src/Resources.ts` (old)

### Step 2: Create sub-chart `sumicare_openbao_server`
- `package.json`, `rslib.config.ts`, `tsconfig.json`
- `src/Config.ts` — server-specific config schema
- `src/Version.ts` — server version resolver
- `src/Resources/StatefulSet.ts` — based on `openbao-helm/templates/server-statefulset.yaml`
- `src/Resources/Service.ts` — three services (ClusterIP, headless, HA-active)
- `src/Resources/ConfigMap.ts` — server config JSON
- `src/Resources/ServiceAccount.ts` — server SA + optional token secret
- `src/OpenbaoServerChart.ts` — compose server resources
- `test/OpenbaoServerChartTest.ts` — snapshot test

### Step 3: Create sub-chart `sumicare_openbao_injector`
- `package.json`, `rslib.config.ts`, `tsconfig.json`
- `src/Config.ts` — injector-specific config schema
- `src/Version.ts` — injector version resolver (openbao-k8s)
- `src/Resources/Deployment.ts` — based on `openbao-helm/templates/injector-deployment.yaml` + `openbao-k8s/deploy/injector-deployment.yaml`
- `src/Resources/Service.ts` — injector service (443 → 8080)
- `src/Resources/MutatingWebhook.ts` — MutatingWebhookConfiguration
- `src/Resources/ServiceAccount.ts` — injector SA + TLS certs secret
- `src/OpenbaoInjectorChart.ts` — compose injector resources
- `test/OpenbaoInjectorChartTest.ts` — snapshot test

### Step 4: Create sub-chart `sumicare_openbao_csi`
- `package.json`, `rslib.config.ts`, `tsconfig.json`
- `src/Config.ts` — CSI-specific config schema
- `src/Version.ts` — CSI provider version resolver
- `src/Resources/DaemonSet.ts` — based on `openbao-csi-provider/deployment/openbao-csi-provider.yaml` + `openbao-helm/templates/csi-daemonset.yaml`
- `src/Resources/ConfigMap.ts` — CSI agent config (optional)
- `src/Resources/ServiceAccount.ts` — CSI provider SA
- `src/OpenbaoCsiChart.ts` — compose CSI resources
- `test/OpenbaoCsiChartTest.ts` — snapshot test

### Step 5: Create sub-chart `sumicare_openbao_snapshot`
- `package.json`, `rslib.config.ts`, `tsconfig.json`
- `src/Config.ts` — snapshot agent config schema
- `src/Version.ts` — snapshot agent version resolver
- `src/Resources/CronJob.ts` — based on `openbao-snapshot-agent/kubernetes/cronjob.yaml` + `openbao-helm/templates/snapshotagent-cronjob.yaml`
- `src/Resources/ConfigMap.ts` — snapshot config
- `src/Resources/ServiceAccount.ts` — snapshot SA
- `src/OpenbaoSnapshotChart.ts` — compose snapshot resources
- `test/OpenbaoSnapshotChartTest.ts` — snapshot test

### Step 6: Create stack-level RBAC
- `src/Resources/ClusterRole.ts` — `defineRbac<"server" | "injector" | "csi">` with cluster roles, creates all SAs
- `src/Resources/Role.ts` — `defineRbac<"server" | "injector" | "csi">` with namespace roles, receives pre-existing SAs
- `src/Resources/NetworkPolicy.ts` — server + injector network policies

### Step 7: Create stack-level custom resources
- `src/CustomResources/ServiceMonitor.ts` — Prometheus ServiceMonitors for server + injector
- `src/CustomResources/PrometheusRule.ts` — PrometheusRule for alerting
- `src/CustomResources/PodDisruptionBudget.ts` — PDBs for server + injector

### Step 8: Write Config.ts + Version.ts
- `src/Config.ts` — unified `OpenbaoStackConfigSchema` (see Config Schema Design section)
- `src/Version.ts` — `createVersion` pointing to `openbao/openbao-helm` GitHub repo

### Step 9: Write OpenbaoStack.ts
Main stack chart that composes all sub-charts and stack-level resources:
```typescript
class OpenbaoStack extends Chart {
  readonly config: OpenbaoStackConfig;
  readonly rbac: OpenbaoRbacConstruct;
  readonly server: OpenbaoServerChart;
  readonly injector: OpenbaoInjectorChart | undefined;
  readonly csi: OpenbaoCsiChart | undefined;
  readonly snapshot: OpenbaoSnapshotChart | undefined;
}
```

### Step 10: Write tests
- `test/OpenbaoStackTest.ts` — snapshot test for full stack
- Sub-chart tests (one per sub-chart)

### Step 11: Update Security CRDs (Phase 1 — keep cert-manager temporarily)
- Add `SecretProviderClass` CRD to `CrdSources.ts` and `Crds.ts`
- Do NOT remove cert-manager CRDs yet (Phase 3)

### Step 12: Update SecurityStack.ts
- Update `src/SecurityStack.ts` to compose `OpenbaoStack`
- Update `package.json` dependencies

### Step 13: Remove cert-manager chart (Phase 3)
- Delete `charts/sumicare_cert_manager_chart/` directory
- Remove cert-manager CRDs from `sumicare_security_crds`
- Remove vault-operator CRD from `sumicare_security_crds`

### Step 14: Remove bank-vaults Terraform files (Phase 3)
- Delete all `base/*.tf` files
- Delete `base/templates/` directory
- Delete `base/render/` directory
- Keep `base/openbao*/` and `base/go-kms-wrapping/` as reference

### Step 15: Migrate compute stack consumers (Phase 2)
For each consumer chart:
- Replace `CertManagerCertificate` with `SecretProviderClass` (CSI-based TLS)
- Replace `CertManagerClusterIssuer` (Vault auth) with direct OpenBao PKI via CSI
- Remove `@sumicare/stack-security-crds` cert-manager imports
- Add `SecretProviderClass` config schema
- Update tests

### Step 16: Update README.md
- Document the OpenBao-only architecture
- Document configuration options for server, injector, CSI, snapshot agent
- Document migration path for consumers

---

## File Inventory

### Files to Create (Phase 1)

**Stack level:**
- `charts/sumicare_openbao_stack/src/OpenbaoStack.ts`
- `charts/sumicare_openbao_stack/src/Config.ts`
- `charts/sumicare_openbao_stack/src/Version.ts`
- `charts/sumicare_openbao_stack/src/Resources/ClusterRole.ts`
- `charts/sumicare_openbao_stack/src/Resources/Role.ts`
- `charts/sumicare_openbao_stack/src/Resources/NetworkPolicy.ts`
- `charts/sumicare_openbao_stack/src/Resources.ts`
- `charts/sumicare_openbao_stack/src/CustomResources/ServiceMonitor.ts`
- `charts/sumicare_openbao_stack/src/CustomResources/PrometheusRule.ts`
- `charts/sumicare_openbao_stack/src/CustomResources/PodDisruptionBudget.ts`
- `charts/sumicare_openbao_stack/src/CustomResources.ts`
- `charts/sumicare_openbao_stack/test/OpenbaoStackTest.ts`
- `charts/sumicare_openbao_stack/package.json` (updated)
- `charts/sumicare_openbao_stack/tsconfig.json` (updated)
- `charts/sumicare_openbao_stack/rslib.config.ts` (updated)
- `charts/sumicare_openbao_stack/rstest.config.ts` (updated)
- `charts/sumicare_openbao_stack/README.md` (updated)

**Server sub-chart:**
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/package.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/rslib.config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/tsconfig.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/OpenbaoServerChart.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Version.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Resources/StatefulSet.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Resources/Service.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Resources/ConfigMap.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Resources/ServiceAccount.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/src/Resources.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_server/test/OpenbaoServerChartTest.ts`

**Injector sub-chart:**
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/package.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/rslib.config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/tsconfig.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/OpenbaoInjectorChart.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Version.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Resources/Deployment.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Resources/Service.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Resources/MutatingWebhook.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Resources/ServiceAccount.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/src/Resources.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_injector/test/OpenbaoInjectorChartTest.ts`

**CSI sub-chart:**
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/package.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/rslib.config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/tsconfig.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/OpenbaoCsiChart.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Version.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Resources/DaemonSet.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Resources/ConfigMap.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Resources/ServiceAccount.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/src/Resources.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_csi/test/OpenbaoCsiChartTest.ts`

**Snapshot sub-chart:**
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/package.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/rslib.config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/tsconfig.json`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/OpenbaoSnapshotChart.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Config.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Version.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Resources/CronJob.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Resources/ConfigMap.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Resources/ServiceAccount.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/src/Resources.ts`
- `charts/sumicare_openbao_stack/src/charts/sumicare_openbao_snapshot/test/OpenbaoSnapshotChartTest.ts`

### Files to Delete (Phase 1 — bank-vaults CDK8s code)
- `charts/sumicare_bank_vaults_stack/src/BankVaultsChart.ts`
- `charts/sumicare_bank_vaults_stack/src/BankVaultsStack.ts`
- `charts/sumicare_bank_vaults_stack/src/Config.ts`
- `charts/sumicare_bank_vaults_stack/src/Version.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources/ClusterRole.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources/Deployment.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources/MutatingWebhook.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources/Role.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources/Service.ts`
- `charts/sumicare_bank_vaults_stack/src/Resources.ts`
- `charts/sumicare_bank_vaults_stack/charts/sumicare_openbao_chart/` (entire sub-directory — flatten into new sub-charts)
- `charts/sumicare_bank_vaults_stack/test/BankVaultsChartTest.ts`
- `charts/sumicare_bank_vaults_stack/test/BankVaultsStackTest.ts`

### Files to Delete (Phase 3 — Terraform + cert-manager)
- `base/deployment_vault_operator.tf`
- `base/deployment_secrets_webhook.tf`
- `base/deployment_secrets_reloader.tf`
- `base/cr_webhook_mutating.tf`
- `base/rbac.tf`
- `base/service_account.tf`
- `base/services.tf`
- `base/secrets.tf`
- `base/variables.tf`
- `base/locals.tf`
- `base/versions.tf`
- `base/output.tf`
- `base/templates/` (entire directory)
- `base/render/` (entire directory)
- `charts/sumicare_cert_manager_chart/` (entire directory)
- `charts/sumicare_security_crds/crds/crd-certmanager-*.yaml` (6 files)
- `charts/sumicare_security_crds/crds/crd-vault-operator-vaults.yaml`
- `charts/sumicare_security_crds/imports/certificate-cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/certificaterequest-cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/challenge-acme.cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/clusterissuer-cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/issuer-cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/order-acme.cert-manager.io.ts`
- `charts/sumicare_security_crds/imports/vault-vault.banzaicloud.com.ts`

### Files to Modify
- `charts/sumicare_security_crds/src/CrdSources.ts` — add SecretProviderClass, (Phase 3: remove cert-manager + vault-operator)
- `charts/sumicare_security_crds/src/Crds.ts` — add SecretProviderClass export, (Phase 3: remove cert-manager + vault exports)
- `src/SecurityStack.ts` — compose OpenbaoStack
- `package.json` (security stack) — update dependencies
- `charts/sumicare_kamaji_stack/charts/sumicare_kamaji_controller_chart/` — replace cert-manager usage (Phase 2)
- `charts/sumicare_descheduler_chart/` — replace cert-manager usage (Phase 2)
- `charts/sumicare_goldilocks_stack/charts/sumicare_goldilocks_dashboard_chart/` — replace cert-manager usage (Phase 2)

---

## Execution Order

### Phase 1 — OpenBao Stack (single PR)
1. Rename `sumicare_bank_vaults_stack` → `sumicare_openbao_stack`, remove old bank-vaults CDK8s code
2. Create `sumicare_openbao_server` sub-chart (StatefulSet, Services, ConfigMap, SA)
3. Create `sumicare_openbao_injector` sub-chart (Deployment, Service, MutatingWebhook, SA)
4. Create `sumicare_openbao_csi` sub-chart (DaemonSet, ConfigMap, SA)
5. Create `sumicare_openbao_snapshot` sub-chart (CronJob, ConfigMap, SA)
6. Create stack-level RBAC (ClusterRole.ts, Role.ts, NetworkPolicy.ts)
7. Create stack-level custom resources (ServiceMonitor, PrometheusRule, PDB)
8. Write unified Config.ts + Version.ts
9. Write OpenbaoStack.ts (compose all sub-charts + stack-level resources)
10. Write tests (stack + sub-chart snapshot tests)
11. Add SecretProviderClass CRD to `sumicare_security_crds`
12. Update SecurityStack.ts to compose OpenbaoStack
13. Update README.md

### Phase 2 — Consumer Migration (separate PR)
14. Migrate `sumicare_kamaji_controller_chart` — replace cert-manager with CSI/SecretProviderClass
15. Migrate `sumicare_descheduler_chart` — replace cert-manager with CSI/SecretProviderClass
16. Migrate `sumicare_goldilocks_dashboard_chart` — replace cert-manager with CSI/SecretProviderClass

### Phase 3 — Cleanup (separate PR)
17. Remove cert-manager CRDs from `sumicare_security_crds`
18. Remove vault-operator CRD from `sumicare_security_crds`
19. Delete `charts/sumicare_cert_manager_chart/` directory
20. Delete bank-vaults Terraform files from `base/`
21. Delete bank-vaults template/render directories from `base/`

---

## Key Design Decisions

1. **Sub-chart per component** — Each OpenBao component (server, injector, CSI, snapshot) is a separate CDK8s sub-chart with its own package.json, config, version, and tests. This mirrors the OpenBao Helm chart's structure and allows independent versioning and testing.

2. **No bank-vaults operator** — OpenBao doesn't need an operator; it's configured via ConfigMap and managed as a StatefulSet. The Vault CRD is unnecessary.

3. **No cert-manager** — OpenBao's injector auto-generates its TLS certificates via `AGENT_INJECT_TLS_AUTO`, which creates a CA and serving certificate from the MutatingWebhookConfiguration name. Other webhooks (Kamaji, etc.) can use OpenBao PKI via CSI or self-signed certs.

4. **Injector replaces secrets-webhook** — OpenBao's `openbao-k8s agent-inject` is a proper mutating webhook that injects sidecar agents into pods, replacing bank-vaults' env-var mutation approach. The injector listens on `:8080` and serves HTTPS with auto-generated TLS.

5. **No secrets-reloader** — OpenBao agents handle secret rotation natively via template rendering and static secret render intervals. The reloader's function (watching deployments and restarting them on secret changes) is handled by the agent's template engine.

6. **CSI provider for volume mounts** — The CSI provider DaemonSet runs on all Linux nodes and serves OpenBao secrets via the Secrets Store CSI driver interface. Pods mount secrets as files via `SecretProviderClass` resources.

7. **Snapshot agent for backups** — Optional CronJob for periodic OpenBao raft snapshots to S3. Uses Kubernetes SA auth to OpenBao and s3cmd for upload.

8. **RBAC follows cert-manager convention** — ClusterRole.ts creates SAs + cluster roles; Role.ts creates namespace roles receiving pre-existing SAs. This is the established pattern in the codebase.

9. **Terraform files are bank-vaults** — The `base/*.tf` files are the existing bank-vaults Terraform stack (operator, reloader, webhook). They are replaced by CDK8s and deleted in Phase 3.

10. **Go source directories kept as reference** — The `base/openbao*/` and `base/go-kms-wrapping/` directories are upstream OpenBao source code used as reference for building CDK8s resources. They are kept for future reference.
