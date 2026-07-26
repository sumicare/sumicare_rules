# 🏗️ `sumicare_rules`

`sumicare_rules` is a [Bazel](https://bazel.build/)-based framework for building and deploying applications
together with their platform infrastructure.

Binaries, container images, infrastructure plans, Kubernetes manifests, policy checks, and tests are all Bazel targets in a single dependency graph. When a source file changes, Bazel rebuilds only what is affected - no CI scripts needed to orchestrate the process.

- 📦 Manifests reference immutable image digests rather than tags copied between CI jobs.
- 🔧 Infrastructure, platform, and SBOM/provenance tools are pinned as [Bazel](https://bazel.build/) toolchains and connected through
  target dependencies.
- 📜 [Helm](https://helm.sh/) charts are replaced by [CDK8s stacks](./packages/stacks/) that generate Kubernetes resources and
  platform integrations from typed TypeScript code.

> 🚧 **Status:** Under active development. Not stable; component maturity varies.

## 🧱 Engineering Value

Each item describes a common operational issue this framework addresses.

- **Artifact identity drift** - Deployments reference immutable digests produced by the build, not mutable tags copied between delivery stages.
- **Toolchain non-determinism** - All tools are pinned as Bazel inputs; local and CI builds use identical artifacts.
- **Redundant pipeline execution** - Builds are content-addressed; only targets whose inputs changed are rebuilt.
- **Implicit infrastructure ordering** - State boundaries between landing zone, network, cluster, and workload are expressed as target dependencies, queryable via `bazel query`.
- **Late-stage policy rejection** - Manifests, SBOMs, and plans are validated during `bazel test`, surfacing issues before deployment.
- **Inferred permissions** - Test deployments are audit-logged; permission inference and security policy are backed by evidence rather than assumption.
- **Chart template sprawl** - [Helm](https://helm.sh/) is replaced by [CDK8s stacks](./packages/stacks/); platform integrations are typed code in a single repository.
- **Unbounded environment lifecycle** - Lifecycle and FinOps quotas are defined as target attributes; environments are disposable and cost-bounded by construction.
- **Build/apply conflation** - Build targets are deterministic and cacheable; cloud API calls and state mutation remain explicit operational actions, not hermetic build steps.
- **Unobserved privilege escalation** - Exact digests are deployed into isolated accounts; observed runtime behavior is compared against requested permissions, and unexplained escalation is blocked and reported.
- **Unaccounted infrastructure drift** - Deployed state is continuously compared against declared targets; unexplained drift is reported as an incident.

## 📦 Components

RCNA replaces [Helm](https://helm.sh/) with ten [CDK8s stacks](./packages/stacks/).

- Full stack catalog is at [RCNA.md](./RCNA.md)
- See [ARCHITECTURE.md](./ARCHITECTURE.md) for brief design rationale and tool comparison

## 🤝 Contributing

Contributions are welcome.

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for the current list of contributors.

## 📄 License

Distributed under the terms of the [MIT License](./LICENSE).

Trademark attribution and graphic material license details are documented in
[ATTRIBUTION.md](./ATTRIBUTION.md).

## ⚖️ Disclaimer

All product names, marks, graphic material, and brands referenced in this documentation are the property of
their respective owners. Their use here is for identification and reference only and does not imply
endorsement or affiliation. Sumicare is not affiliated with, endorsed by, or sponsored by any upstream project
or its governing foundation unless explicitly stated.

This is a non-commercial project. Limited commercial support (deployment assistance, consulting, and
maintenance) may be offered case by case; such services do not constitute a commercial license of the
software, which remains freely available under the MIT License. The SGLang graphic material
(CC BY-NC-ND 4.0) is not used in any commercial-facing context.
