# 🏗️ `rules_sumicare` Architecture

## 📋 Overview

`rules_sumicare` is a Bazel-based framework for building and deploying applications together with their platform infrastructure. Binaries, container images, infrastructure plans, Kubernetes manifests, policy checks, and tests are represented as Bazel targets connected through declared dependencies. When a source file changes, Bazel determines which targets require rebuilding; no external CI scripts orchestrate this process.

- 📦 Manifests reference immutable image digests produced by the image build target, rather than tags that CI processes copy between jobs.
- 🔧 [OpenTofu](https://opentofu.org), [CDKTN](https://cdktn.io/), [CDK8s](https://cdk8s.io/), [Argo CD](https://argoproj.github.io/argo-cd/), and SBOM/provenance tools ([Syft](https://github.com/anchore/syft), [Grype](https://github.com/anchore/grype), [Trivy](https://trivy.dev/), [Cosign](https://github.com/sigstore/cosign)) are pinned as Bazel toolchains and connected through target dependencies.
- 📜 RCNA replaces [Helm](https://helm.sh/) charts with [CDK8s](https://cdk8s.io/) stacks that generate Kubernetes resources and platform integrations from typed code.

## 🧱 Key Properties

- **Single dependency graph.** Only targets whose inputs changed are rebuilt; unchanged targets are served from cache.
- **Image digests instead of tags.** Manifests reference the immutable digest produced by the image build target.
- **Pinned toolchains.** All tools ([OpenTofu](https://opentofu.org/), [CDKTN](https://cdktn.io/), [CDK8s](https://cdk8s.io/), [Argo CD](https://argoproj.github.io/argo-cd/), [Syft](https://github.com/anchore/syft), [Grype](https://github.com/anchore/grype), [Trivy](https://trivy.dev/), [Cosign](https://github.com/sigstore/cosign)) are sandboxed Bazel inputs with remote caching and remote execution support.
- **Reviewable outputs.** Plans, manifests, SBOMs, signatures, provenance, and audit evidence can be inspected in pull requests prior to promotion.
- **State boundaries expressed as dependencies.** Ordering between landing-zone, network, cluster, and workload plans is expressed through target dependencies rather than shell scripts.
- **CDK8s stacks instead of Helm charts.** Stacks generate Kubernetes resources and cross-stack contracts for DNS, TLS, identity, secrets, telemetry, policy, persistence, and GitOps. The PKI stack is simplified by incorporating OpenBao deeply and replacing cert-manager.
- **Cost controls included.** [KEDA](https://keda.sh/) scales idle workloads to zero; [VPA](https://github.com/kubernetes/autoscaler) and [Goldilocks](https://github.com/FairwindsOps/goldilocks) surface poor resource sizing; [Descheduler](https://github.com/kubernetes-sigs/descheduler) improves pod placement; [OpenCost](https://www.opencost.io/) attributes spend.
- **Secrets management unified.** [OpenBao](https://openbao.org/) provides a single open-source secrets backend with agent injection (mutating webhook), CSI provider for volume-mounted secrets, and raft snapshot backups — replacing cert-manager for a simplified PKI stack.
- **Explicit cloud adapters.** Platform services use Kubernetes APIs where possible; provider-specific identity, DNS, and storage configuration remain explicit.
- **Consistent interface across users.** `bazel query` inspects dependencies; `bazel build` produces artifacts; `bazel test` runs validation gates; GitOps applies changes.
- **One graph across environments.** Development, staging, and production differ only in platform constraints, credentials, and parameter values.
- **Human input is versioned.** Approvals and decisions are stored as artifacts with signed audit entries.

## 🔍 Comparison with Related Tools

Most delivery tools address a single part of the process. `rules_sumicare` connects their inputs and outputs through a shared Bazel dependency graph.

- **[Terraform](https://www.terraform.io/) / [OpenTofu](https://opentofu.org/)**
  - Strengths: declarative infrastructure, planning, state management.
  - Limitation: graph begins at infrastructure, not application artifacts.
  - Role in this framework: pinned toolchain with Bazel-connected state boundaries.

- **[Pulumi](https://www.pulumi.com/)**
  - Strengths: infrastructure defined as general-purpose code.
  - Limitation: requires Pulumi Cloud for state; this stack targets air-gapped environments.
  - Role in this framework: not used; OpenTofu provides state without external dependencies.

- **[Terragrunt](https://terragrunt.gruntwork.io/)**
  - Strengths: organizes Terraform modules and remote state.
  - Limitation: does not connect to compiled binaries, schemas, images, or tests.
  - Role in this framework: Bazel dependencies provide cross-domain orchestration instead.

- **[Helm](https://helm.sh/) / [Kustomize](https://kustomize.io/)**
  - Strengths: packaging and customization of Kubernetes resources.
  - Limitation: scope ends at a single product; cross-stack contracts are left to the operator.
  - Role in this framework: replaced by CDK8s stacks that include platform integrations.

- **[Crossplane](https://crossplane.io/) / cloud controllers**
  - Strengths: reconcile infrastructure through Kubernetes APIs.
  - Limitation: requires a running cluster; cannot bootstrap organization, network, or identity.
  - Role in this framework: used after bootstrap for Kubernetes-native reconciliation.

- **[Nix](https://nixos.org/) / [Guix](https://guix.gnu.org/)**
  - Strengths: reproducible packages and environments.
  - Limitation: primary abstraction is package composition, not Bazel's action graph.
  - Role in this framework: can provide hermetic tools that Bazel consumes.

- **[Dagger](https://dagger.io/) / [Earthly](https://earthly.dev/)**
  - Strengths: container-oriented CI pipelines with BuildKit caching.
  - Limitation: pipeline graphs are not equivalent to Bazel's target graph.
  - Role in this framework: external CI orchestration; Bazel remains the dependency graph.

- **[Skaffold](https://skaffold.dev/) / [Tilt](https://tilt.dev/)**
  - Strengths: fast local Kubernetes development loops.
  - Limitation: no landing zones, state boundaries, or production policy gates.
  - Role in this framework: can invoke Bazel targets for local iteration without duplicating logic.

- **[Loft.sh](https://loft.sh/) / [vCluster](https://www.vcluster.com/)**
  - Strengths: virtual Kubernetes clusters for multi-tenant development and testing.
  - Limitation: vCluster's open-source edition is limited; key features are paywalled and used to promote proprietary offerings such as vNode, vMetal, and the Loft platform.
  - Role in this framework: not used; self-managed clusters and Kamaji control planes provide virtual cluster capabilities without vendor lock-in.

- **[Bazel](https://bazel.build/) GitOps / Terraform rulesets**
  - Strengths: bring manifest or Terraform operations into Bazel.
  - Limitation: scope is limited to one delivery domain rather than application-to-infrastructure.
  - Role in this framework: `rules_sumicare` composes the broader graph and can reuse compatible rules.
  - Notable rulesets: [adobe/rules_gitops](https://github.com/adobe/rules_gitops), [wix-playground/wix_build_tools](https://github.com/wix-playground/wix_build_tools), [mitchelldavis/rules_terraform](https://github.com/mitchelldavis/rules_terraform), [yanndegat/rules_tf](https://github.com/yanndegat/rules_tf).

## 📐 Design Principles

1. **Delivery relationships are declared dependencies**, not CI scripts.
2. **Build outputs are immutable inputs.** Plans and manifests reference the exact upstream artifacts they depend on.
3. **Build is separated from apply.** Generation is cacheable; state changes are explicit operational actions.
4. **State boundaries are intentional.** Each stage has its own lifecycle and failure domain.
5. **Native provider capabilities are used where appropriate.** [OpenTofu](https://opentofu.org/), [CloudFormation](https://aws.amazon.com/cloudformation/), [Bicep/ARM](https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/), and provider APIs are composed as needed.
6. **Policy validation runs before delivery.** Validation failures occur during `bazel test`, prior to deployment.
7. **No ambient toolchains or credentials.** Tools are pinned for builds; short-lived, scoped identities are used for privileged operations.
8. **Runtime behavior informs policy but does not self-approve.** Evidence identifies permissions; reviewed policy defines what is allowed.
9. **Adoption is composable.** Teams can start with images, manifests, validation, or a single infrastructure stage.

## 🎯 Scope and Boundaries

**✅ Intended to:**

- Connect application and infrastructure artifacts within a single graph
- Represent organization and account lifecycle as declared dependencies
- Provide inspectable, incremental delivery dependencies
- Support hermetic generation and validation with remote caching
- Produce artifacts for GitOps and controlled deployment
- Derive permission evidence from isolated test deployments
- Apply reviewed permission baselines during promotion
- Maintain traceability from source change to delivered artifact

**❌ Not intended to:**

- Replace cloud control planes or GitOps loops
- Treat infrastructure state as cacheable
- Make cloud operations hermetic
- Auto-translate between IaC formats
- Remove provider-specific architecture

## 📊 Practical Outcome

RCNA applies the Bazel dependency graph approach to the platform layer: CDK8s stacks replace Helm charts and generate Kubernetes resources with platform integrations from typed code. The platform uses portable Kubernetes services and self-managed components instead of mandatory SaaS dependencies, with explicit cloud adapters used where provider-native services are more appropriate.

Observable results include: fewer CI handoff scripts, elimination of mutable tags between build and deployment, target-level cache reuse, reviewable plans and manifests, policy checks applied against the deployable artifact, permission diffs backed by audit evidence, GitOps blocking of unexplained privilege escalation, infrastructure drift detection reported as incidents, and queryable blast radius.
