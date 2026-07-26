# Cdk8s Cdktn

Bidirectional [cdk8s](https://cdk8s.io/) <-> [CDKTN](https://cdktn.io/) integration: a provider that converts cdk8s manifests into CDKTN `kubernetes_manifest` resources, and a resolver that injects CDKTN `TerraformOutput` values into cdk8s manifests at synthesis time.

Part of **rules_sumicare** — a collection of reusable Bazel rules for platform engineering implementing Reference Cloud Native Architecture (RCNA) patterns and practices.

## Overview

This library (`@sumicare/cdk8s-cdktn`) is a component of the Sumicare platform engineering toolkit. It provides two complementary entry points:

- **`@sumicare/cdk8s-cdktn`** — the provider (cdk8s -> CDKTN)
- **`@sumicare/cdk8s-cdktn/resolver`** — the resolver (CDKTN -> cdk8s)

## Provider

The provider converts cdk8s manifests into CDKTN `kubernetes_manifest` resources. This lets you manage Kubernetes resources through CDKTN/Terraform using cdk8s constructs.

```ts
import * as cdk8s from "cdk8s";
import { App, TerraformStack } from "cdktn";
import { createCdk8sProvider } from "@sumicare/cdk8s-cdktn";

// 1. Define k8s manifests with cdk8s
const cdk8sApp = new cdk8s.App();
const chart = new cdk8s.Chart(cdk8sApp, "chart");
new cdk8s.ApiObject(chart, "ConfigMap", {
  apiVersion: "v1",
  kind: "ConfigMap",
  metadata: { name: "app-config" },
  data: { key: "value" },
});

// 2. Define a CDKTN stack that deploys those manifests
const tfApp = new App();
const stack = new TerraformStack(tfApp, "Stack");
createCdk8sProvider({
  scope: stack,
  id: "cdk8s-provider",
  config: { cdk8sApp },
});

// 3. Synth CDKTN -- the provider's aspect fires during synthesis,
//    calling cdk8sApp.synthYaml() and creating kubernetes_manifest resources
tfApp.synth();
```

The provider also exports `escapeTerraformInterpolation`, `manifestId`, and `parseManifests` as helper utilities.

## Resolver

The resolver injects CDKTN `TerraformOutput` values into cdk8s manifests at cdk8s synthesis time. `cdk8s synth` must run *after* `cdktn deploy`.

```ts
import * as cdk8s from "cdk8s";
import { App, TerraformOutput, TerraformStack } from "cdktn";
import { AwsProvider, S3Bucket } from "@cdktn/provider-aws";
import { createCdkTnResolver } from "@sumicare/cdk8s-cdktn/resolver";

// 1. Define infrastructure with CDKTN
const awsApp = new App();
const stack = new TerraformStack(awsApp, "aws");
new AwsProvider(stack, "aws", { region: "us-east-1" });

const bucket = new S3Bucket(stack, "Bucket", { bucket: "my-bucket" });
new TerraformOutput(stack, "BucketName", { value: bucket.bucket });

// 2. Define k8s manifests with cdk8s, referencing CDKTN output tokens
const k8sApp = new cdk8s.App({
  resolvers: [createCdkTnResolver({ app: awsApp })],
});

const chart = new cdk8s.Chart(k8sApp, "Manifest");
new cdk8s.ApiObject(chart, "ConfigMap", {
  apiVersion: "v1",
  kind: "ConfigMap",
  metadata: { name: "app-config" },
  // bucket.bucket is an unresolved token at authoring time.
  // The resolver fetches the real value from deployed CDKTN state.
  data: { BUCKET_NAME: bucket.bucket },
});

// 3. Deploy CDKTN first, then synth cdk8s
awsApp.synth();
k8sApp.synth();
```

### Fetch strategies

The resolver supports three output-fetching strategies, selected via props:

| Strategy | Prop | Description | Use case |
|---|---|---|---|
| **CDKTN CLI** | `cdktnCli` (default) | Runs `cdktn output` against synthesized CDKTN app | Production, standard CDKTN workflow |
| **Tofu direct** | `tofuDirect` | Runs `tofu output -json` per stack, bypassing CDKTN CLI | When CDKTN CLI is unavailable or too slow |
| **Custom function** | `fetchOutputsFn` | User-provided `(app: App) => StackOutputs` function | Testing, mocking, alternative state backends |

Precedence: `fetchOutputsFn` > `tofuDirect` > `cdktnCli`.

```ts
// Default (cdktnCli)
createCdkTnResolver({ app: awsApp });

// Direct tofu output
createCdkTnResolver({
  app: awsApp,
  tofuDirect: { workingDirectory: "./cdktn.out/stacks/infra" },
});

// Custom fetch (e.g. for tests)
createCdkTnResolver({
  app: awsApp,
  fetchOutputsFn: () => ({
    infra: { BucketName: "my-resolved-bucket-name" },
  }),
});
```

## License

Distributed under the terms of the [MIT License](../../../LICENSE).

For full trademark attribution and graphic material license details, see [ATTRIBUTION.md](../../../ATTRIBUTION.md).

## Disclaimer

All product names, marks, graphic material, and brands referenced in this documentation are the property of their respective owners. 
Their use here is for identification and reference only and does not imply endorsement or affiliation.
Sumicare is not affiliated with, endorsed by, or sponsored by any upstream project or its governing foundation unless explicitly stated.

## Attribution

> cdk8s™ is a trademark of The Linux Foundation. cdk8s is a CNCF Sandbox Project, licensed under Apache 2.0. Apache 2.0 §6 does not grant trademark rights. Use is subject to the [Linux Foundation Trademark Usage Guidelines](https://www.linuxfoundation.org/legal/trademark-usage).

> CDK Terrain (CDKTN) is a community fork of the Cloud Development Kit for Terraform (CDKTF), stewarded by the [Open Construct Foundation](https://the-ocf.org). CDKTN is licensed under MPL-2.0. The project was renamed from CDKTF to CDKTN due to trademark considerations. MPL-2.0 does not grant trademark rights.

> OpenTofu is a CNCF-hosted project, licensed under MPL-2.0. Use is subject to the [Linux Foundation Trademark Usage Guidelines](https://www.linuxfoundation.org/legal/trademark-usage).
