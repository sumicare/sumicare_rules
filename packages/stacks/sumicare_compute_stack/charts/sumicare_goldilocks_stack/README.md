<table border="0" cellpadding="8" cellspacing="0">
  <tr>
    <td valign="middle" align="center">
      <a href="https://github.com/FairwindsOps/goldilocks"><img src="../../../../services/sumicare_documentation/src/images/logo/compute-goldilocks.svg" height="48" alt="Goldilocks" /></a>
    </td>
    <td valign="middle" align="center">
      <h3><a href="https://github.com/FairwindsOps/goldilocks">Goldilocks</a></h3>
      <p>Sumicare Stack</p>
    </td>
  </tr>
</table>

Fairwinds Goldilocks — a Kubernetes controller and dashboard that leverages the Vertical Pod Autoscaler (VPA) in recommendation mode to suggest optimal CPU and memory resource requests and limits.

## Architecture

The Goldilocks stack is split into two independent charts:

### Controller (`@sumicare/chart-goldilocks-controller`)
- Controller Deployment (single replica, leader-elect)
- ServiceAccount, ClusterRole, ClusterRoleBinding
- Metrics Service (port 8080)
- ServiceMonitor for Prometheus

### Dashboard (`@sumicare/chart-goldilocks-dashboard`)
- Dashboard Deployment (2 replicas by default)
- ServiceAccount, ClusterRole, ClusterRoleBinding
- ClusterIP Service (port 80)
- ServiceMonitor for Prometheus
- Optional Ingress / HTTPRoute / Gateway
- Optional Istio mesh (DestinationRule, PeerAuthentication)
- Optional cert-manager Certificate + Vault ClusterIssuer
- Optional Dex OIDC auth (KGateway GatewayExtension)
- Optional Istio JWT auth (RequestAuthentication, AuthorizationPolicy)
- Optional Cilium NetworkPolicy
- Optional Netbird NetworkResource

## Usage

```typescript
import { App } from "cdk8s";
import { GoldilocksControllerChart } from "@sumicare/chart-goldilocks-controller";
import { GoldilocksDashboardChart } from "@sumicare/chart-goldilocks-dashboard";

const app = new App();

new GoldilocksControllerChart(app, "controller");
new GoldilocksDashboardChart(app, "dashboard", {
  ingress: {
    enabled: true,
    hosts: [{ host: "goldilocks.example.com", paths: [{ path: "/", type: "Prefix" }] }],
  },
});

app.synth();
```
