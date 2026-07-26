# Kamaji Stack

A modular CDK8s chart stack for [Kamaji](https://github.com/clastix/kamaji) — the Hosted Control Plane Manager for Kubernetes.

## Architecture

The stack is split into 6 independent charts plus a stack-level ArgoCD app-of-apps orchestrator:

```
sumicare_kamaji_stack/
├── src/
│   ├── ArgocdConfig.ts                        # ArgoCD app-of-apps config schema
│   └── Argocd.ts                              # ArgoCD app-of-apps chart (parent + child Applications)
├── charts/
│   ├── sumicare_kamaji_controller_chart/       # Kamaji controller (Deployment, RBAC, Webhooks, cert-manager, PDB)
│   ├── sumicare_kamaji_etcd_chart/             # Dedicated etcd cluster (StatefulSet, Service, CSR Jobs, ConfigMap)
│   ├── sumicare_kamaji_datastore_chart/        # DataStore CR (etcd/MySQL/PostgreSQL backend definition)
│   ├── sumicare_kamaji_kubeconfig_generator_chart/  # Kubeconfig Generator Deployment
│   ├── sumicare_kamaji_console_chart/          # Kamaji Console UI (Deployment, RBAC, Service, Ingress, Secret)
│   └── sumicare_kamaji_monitoring_chart/       # Prometheus ServiceMonitors + Grafana dashboard ConfigMap
├── package.json
└── tsconfig.json
```

## Charts

### Controller (`@sumicare/chart-kamaji-controller`)
- ServiceAccount, ClusterRole, ClusterRoleBinding, leader-election Role
- Deployment with security hardening, probes, scheduling constraints
- Webhook + Metrics Services (dual-stack)
- cert-manager Issuer and Certificate for webhook TLS
- Mutating and Validating WebhookConfigurations
- Optional PodDisruptionBudget (env-gated)
- Optional Prometheus ServiceMonitor

### Etcd (`@sumicare/chart-kamaji-etcd`)
- Headless Service for StatefulSet peer discovery
- StatefulSet with TLS-enabled client/peer communication
- CSR ConfigMap with cfssl JSON configurations
- Cert generation Job (cfssl + kubectl)
- Setup Job (enables etcd auth)
- Teardown Job (cleans up secrets)

### DataStore (`@sumicare/chart-kamaji-datastore`)
- DataStore custom resource (kamaji.clastix.io/v1alpha1)
- Supports etcd, MySQL, PostgreSQL drivers
- TLS configuration for secure datastore communication

### Kubeconfig Generator (`@sumicare/chart-kamaji-kubeconfig-generator`)
- Deployment running `kamaji kubeconfig-generator`
- Leader election support
- Security hardening

### Console (`@sumicare/chart-kamaji-console`)
- Kamaji Console UI (Next.js) from [kamaji-console](https://github.com/clastix/kamaji-console)
- ServiceAccount, ClusterRole, ClusterRoleBinding
- Credentials Secret (NextAuth, JWT, admin credentials, Sveltos config)
- ClusterIP Service
- Optional Ingress

### Monitoring (`@sumicare/chart-kamaji-monitoring`)
- ServiceMonitor for controller metrics (port 8080)
- ServiceMonitor for etcd metrics (port 2379)
- Grafana dashboard ConfigMap (controller status, TCP count, datastore connections, etcd health)

### KamajiApp (stack-level `src/Argocd.ts`)
- **Parent Application** (app-of-apps): points to `basePath` in the Git repo, syncs all child Application manifests
- **Child Applications**: one per enabled component, each pointing to its chart's manifest path
- Optional AppProject scoping the Kamaji stack
- Sync waves on child apps enforce ordering: etcd -> controller -> datastore -> kubeconfig-generator -> console -> monitoring
- Automated sync with prune and self-heal

## GitOps Deployment

The ArgoCD chart uses the **app-of-apps** pattern: a single parent Application syncs the stack directory, which contains child Application manifests for each component. Child apps are synced in ordered waves:

| Wave | Component               |
|------|-------------------------|
| -1   | parent (app-of-apps)    |
| 0    | etcd                    |
| 1    | controller              |
| 2    | datastore               |
| 3    | kubeconfig-generator    |
| 4    | console                 |
| 5    | monitoring              |

## Usage

```typescript
import { App } from "cdk8s";
import { KamajiControllerChart } from "@sumicare/chart-kamaji-controller";
import { KamajiEtcdChart } from "@sumicare/chart-kamaji-etcd";
import { KamajiDataStoreChart } from "@sumicare/chart-kamaji-datastore";
import { KamajiConsoleChart } from "@sumicare/chart-kamaji-console";
import { KamajiMonitoringChart } from "@sumicare/chart-kamaji-monitoring";
import { KamajiApp } from "Kamaji/Stack/Argocd";

const app = new App();

new KamajiEtcdChart(app, "etcd");
new KamajiControllerChart(app, "controller");
new KamajiDataStoreChart(app, "datastore", {
  endpoints: ["https://etcd-0.etcd.kamaji-system.svc.cluster.local:2379"],
});
new KamajiConsoleChart(app, "console", {
  credentialsSecret: { generate: true, email: "admin@example.com", password: "..." },
});
new KamajiMonitoringChart(app, "monitoring");
new KamajiApp(app, "argocd", {
  repoURL: "https://github.com/org/kamaji-manifests",
});

app.synth();
```
