<table border="0" cellpadding="8" cellspacing="0">
  <tr>
    <td valign="middle" align="center">
      <a href="https://github.com/kubernetes-sigs/descheduler"><img src="https://raw.githubusercontent.com/kubernetes-sigs/descheduler/master/assets/logo/descheduler-stacked-color.png" width="128" alt="Descheduler" /></a>
    </td>
    <td valign="middle" align="center">
      <h3><a href="https://github.com/kubernetes-sigs/descheduler">Descheduler</a></h3>
      <p>Sumicare Chart</p>
    </td>
  </tr>
</table>

Kubernetes Descheduler - finds pods that can be moved and evicts them based on configurable scheduling strategies to improve cluster resource utilization.

## Usage

```typescript
import { App } from "cdk8s";
import { DeschedulerChartBuilder } from "@sumicare/chart-compute-descheduler";

const app = new App();

await DeschedulerChartBuilder.create(app, "descheduler")
  .set("namespace", "kube-system")
  .set("version", "0.36.0") // defaults to KnownLatestDeschedulerVersion
  .set("image", "registry.k8s.io/descheduler/descheduler:v0.36.0") // optional override
  .set("replicas", 3)
  .set("deschedulingInterval", "5m")
  .set("logVerbosity", "3")
  .set("dryRun", false)
  .set("disableMetrics", false)
  .set("enableHTTP2", true)
  .set("runAsUser", 1001)
  .set("runAsGroup", 1001)
  .set("fsGroup", 1001)
  .set("priorityClassName", "system-cluster-critical")
  .set("revisionHistoryLimit", 10)
  .set("metricsPort", 10258)
  .set("leaderElection", {
    enabled: true,
    leaseDuration: "15s",
    renewDeadline: "10s",
    retryPeriod: "2s",
    resourceLock: "leases",
    resourceName: "descheduler",
    resourceNamespace: "kube-system",
  })
  .set("resources", {
    limits: { cpu: "500m", memory: "256Mi" },
    requests: { cpu: "100m", memory: "128Mi" },
  })
  .set("tracing", {
    collectorEndpoint: "http://otel-collector.observability.svc.cluster.local:4317",
    transportCert: undefined, // optional TLS CA cert path
    serviceName: "descheduler",
    serviceNamespace: "kube-system",
    sampleRate: 0.1,
    fallbackToNoOpProviderOnError: true,
  })
  .set("featureGates", {
    EvictionsInBackground: false,
  })
  .set("clientConnection", {
    qps: 100,
    burst: 200,
  })
  .set("policy", {
    apiVersion: "descheduler/v1alpha2",
    kind: "DeschedulerPolicy",
    nodeSelector: undefined, // optional node label selector
    maxNoOfPodsToEvictPerNode: 10,
    maxNoOfPodsToEvictPerNamespace: undefined, // optional per-namespace eviction limit
    maxNoOfPodsToEvictTotal: undefined, // optional total eviction limit
    evictionFailureEventNotification: false,
    gracePeriodSeconds: undefined, // optional eviction grace period
    profiles: [
      {
        name: "default",
        pluginConfig: [
          {
            name: "DefaultEvictor",
            args: {
              nodeSelector: undefined,
              labelSelector: undefined,
              namespaceLabelSelector: undefined,
              nodeFit: undefined,
              minReplicas: undefined,
              minPodAge: undefined,
              priorityThreshold: { value: undefined, name: undefined },
              noEvictionPolicy: undefined, // "Preferred" | "Mandatory"
              podProtections: {
                defaultDisabled: ["PodsWithLocalStorage"],
                extraEnabled: ["PodsWithPVC"],
                config: {
                  PodsWithPVC: {
                    protectedStorageClasses: [{ name: "standard" }],
                  },
                },
              },
            },
          },
          {
            name: "RemoveDuplicates",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              excludeOwnerKinds: undefined,
            },
          },
          {
            name: "RemovePodsHavingTooManyRestarts",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              podRestartThreshold: 100,
              includingInitContainers: true,
              states: undefined,
            },
          },
          {
            name: "RemovePodsViolatingNodeAffinity",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              nodeAffinityType: ["requiredDuringSchedulingIgnoredDuringExecution"],
            },
          },
          {
            name: "RemovePodsViolatingNodeTaints",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              includePreferNoSchedule: undefined,
              excludedTaints: undefined,
              includedTaints: undefined,
            },
          },
          {
            name: "RemovePodsViolatingInterPodAntiAffinity",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
            },
          },
          {
            name: "RemovePodsViolatingTopologySpreadConstraint",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              constraints: ["DoNotSchedule", "ScheduleAnyway"],
              topologyBalanceNodeFit: undefined,
            },
          },
          {
            name: "LowNodeUtilization",
            args: {
              useDeviationThresholds: undefined,
              thresholds: { cpu: 20, memory: 20, pods: 20 },
              targetThresholds: { cpu: 50, memory: 50, pods: 50 },
              numberOfNodes: undefined,
              metricsUtilization: {
                metricsServer: undefined,
                source: "KubernetesMetrics", // or "Prometheus"
                prometheus: { query: undefined },
              },
              evictableNamespaces: { include: undefined, exclude: undefined },
              evictionLimits: { node: undefined },
            },
          },
          {
            name: "HighNodeUtilization",
            args: {
              thresholds: { cpu: 20, memory: 20, pods: 20 },
              numberOfNodes: undefined,
              evictionModes: ["OnlyThresholdingResources"],
              evictableNamespaces: { include: undefined, exclude: undefined },
            },
          },
          {
            name: "PodLifeTime",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              ownerKinds: { include: undefined, exclude: undefined },
              maxPodLifeTimeSeconds: 86400,
              states: undefined,
              conditions: [{
                type: undefined,
                status: undefined,
                reason: undefined,
                minTimeSinceLastTransitionSeconds: undefined,
              }],
              exitCodes: undefined,
              includingInitContainers: undefined,
              includingEphemeralContainers: undefined,
            },
          },
          {
            name: "RemoveFailedPods",
            args: {
              namespaces: { include: undefined, exclude: undefined },
              labelSelector: undefined,
              excludeOwnerKinds: undefined,
              minPodLifetimeSeconds: undefined,
              reasons: undefined,
              exitCodes: undefined,
              includingInitContainers: undefined,
            },
          },
        ],
        plugins: {
          preSort: undefined,
          sort: undefined,
          deschedule: {
            enabled: [
              "RemovePodsHavingTooManyRestarts",
              "RemovePodsViolatingNodeTaints",
              "RemovePodsViolatingNodeAffinity",
              "RemovePodsViolatingInterPodAntiAffinity",
            ],
          },
          balance: {
            enabled: [
              "RemoveDuplicates",
              "RemovePodsViolatingTopologySpreadConstraint",
              "LowNodeUtilization",
            ],
          },
          filter: undefined,
          preEvictionFilter: undefined,
        },
      },
    ],
  })
  .build();
```

### Validation

Validate config without building the chart — useful for pre-flight checks and CI gates.

```typescript
import { DeschedulerChartBuilder, LatestDeschedulerVersion } from "@sumicare/chart-compute-descheduler";

// LatestDeschedulerVersion is a promise that fetches the latest release from GitHub.
// It falls back to KnownLatestDeschedulerVersion if the network is unavailable.
const version = await LatestDeschedulerVersion;

const result = DeschedulerChartBuilder.validate({
  name: "descheduler",
  version,
  replicas: 3,
  deschedulingInterval: "5m",
  policy: {
    apiVersion: "descheduler/v1alpha2",
    kind: "DeschedulerPolicy",
    maxNoOfPodsToEvictPerNode: 10,
    profiles: [
      {
        name: "default",
        pluginConfig: [
          { name: "DefaultEvictor" },
          {
            name: "LowNodeUtilization",
            args: {
              thresholds: { cpu: 20, memory: 20, pods: 20 },
              targetThresholds: { cpu: 50, memory: 50, pods: 50 },
            },
          },
        ],
        plugins: {
          balance: { enabled: ["LowNodeUtilization"] },
        },
      },
    ],
  },
});

if (result.success) {
  console.log("Valid:", result.config.name, result.config.version);
} else {
  console.error(result.error);
  //  "replicas must be at least 1"
  //  "must be a Go duration (e.g. 2m, 15s, 1h)"
  //  "threshold not in [0, 100] range"
}
```

### Available Plugins

| Plugin | Extension Points | Description |
|--------|-----------------|-------------|
| `DefaultEvictor` | filter, preEvictionFilter | Default evictor with pod protections |
| `RemoveDuplicates` | balance | Removes duplicate pods across nodes |
| `RemovePodsHavingTooManyRestarts` | deschedule | Removes pods exceeding restart threshold |
| `RemovePodsViolatingNodeAffinity` | deschedule | Removes pods violating node affinity rules |
| `RemovePodsViolatingNodeTaints` | deschedule | Removes pods violating node taints |
| `RemovePodsViolatingInterPodAntiAffinity` | deschedule | Removes pods violating inter-pod anti-affinity |
| `RemovePodsViolatingTopologySpreadConstraint` | balance | Removes pods violating topology spread constraints |
| `LowNodeUtilization` | balance | Evicts pods from underutilized nodes |
| `HighNodeUtilization` | balance | Consolidates pods onto fewer nodes |
| `PodLifeTime` | deschedule | Removes pods exceeding max lifetime |
| `RemoveFailedPods` | deschedule | Removes failed pods based on configurable criteria |

### Config Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `name` | `string` | `"descheduler"` | Deployment and resource name |
| `namespace` | `string` | `"kube-system"` | Kubernetes namespace |
| `version` | `string` | `KnownLatestDeschedulerVersion` | Container image version |
| `image` | `string` | `registry.k8s.io/descheduler/descheduler:v<version>` | Container image override |
| `replicas` | `number` | `2` | Number of pod replicas |
| `deschedulingInterval` | `Go duration` | `"2m"` | Interval between executions |
| `logVerbosity` | `string` | `"3"` | klog verbosity level |
| `leaderElection` | `object` | see below | Leader election config |
| `resources` | `object` | see below | Container resource requests and limits |
| `runAsUser` | `number` | `1001` | Container UID |
| `runAsGroup` | `number` | `1001` | Container GID |
| `fsGroup` | `number` | `1001` | FS group for volumes |
| `priorityClassName` | `string` | `"system-cluster-critical"` | Pod priority class |
| `revisionHistoryLimit` | `number` | `10` | Old ReplicaSets to retain |
| `metricsPort` | `number` | `10258` | HTTPS metrics/healthz port |
| `policy` | `DeschedulerPolicy` | see below | Descheduler policy config |
| `dryRun` | `boolean` | `false` | Evaluate without evicting |
| `disableMetrics` | `boolean` | `false` | Disable metrics endpoint and ServiceMonitor |
| `enableHTTP2` | `boolean` | `true` | Enable HTTP/2 for metrics |
| `tracing` | `object` | see below | OpenTelemetry tracing config |
| `featureGates` | `object` | see below | Alpha/experimental feature gates |
| `clientConnection` | `object` | see below | API server connection tuning |

### Leader Election Defaults

| Option | Default |
|--------|---------|
| `enabled` | `true` |
| `leaseDuration` | `"15s"` |
| `renewDeadline` | `"10s"` |
| `retryPeriod` | `"2s"` |
| `resourceLock` | `"leases"` |
| `resourceName` | `"descheduler"` |
| `resourceNamespace` | `"kube-system"` |

### Resource Defaults

| Resource | Limit | Request |
|----------|-------|---------|
| CPU | `500m` | `100m` |
| Memory | `256Mi` | `128Mi` |

### Tracing Defaults

| Option | Default |
|--------|---------|
| `collectorEndpoint` | `http://otel-collector.observability.svc.cluster.local:4317` |
| `transportCert` | _(insecure)_ |
| `serviceName` | `"descheduler"` |
| `serviceNamespace` | `"kube-system"` |
| `sampleRate` | `0.1` |
| `fallbackToNoOpProviderOnError` | `true` |

### Feature Gates

| Gate | Default | Description |
|------|---------|-------------|
| `EvictionsInBackground` | `false` | Background evictions (alpha, v1.31+) |

## License

Distributed under the terms of the [MIT License](../../../../../LICENSE).

For full trademark attribution and graphic material license details, see [ATTRIBUTION.md](../../../../../ATTRIBUTION.md).

## Disclaimer

All product names, marks, graphic material, and brands referenced in this documentation are the property of their respective owners. 
Their use here is for identification and reference only and does not imply endorsement or affiliation.
Sumicare is not affiliated with, endorsed by, or sponsored by any upstream project or its governing foundation unless explicitly stated.

## Attribution

> Kubernetes® is a registered trademark of The Linux Foundation. Use of this mark is subject to the [Linux Foundation Trademark Usage Guidelines](https://www.linuxfoundation.org/legal/trademark-usage).
