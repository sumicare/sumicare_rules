# 🏗️ RCNA Stacks

RCNA (Reference Cloud Native Architecture) replaces Helm with CDK8s stacks that generate Kubernetes resources from typed code.
Custom [CDK8s](https://cdk8s.io/)-to-[CDKTN](https://cdktn.io/) integration library ([`sumicare_cdktn_cdks8`](../libs/sumicare_cdktn_cdks8/)) provides both a provider (cdk8s -> CDKTN) and a resolver (CDKTN -> cdk8s) to bridge infrastructure and application synthesis.

See [RCNA.md](../../RCNA.md) for the full catalog with component details.
