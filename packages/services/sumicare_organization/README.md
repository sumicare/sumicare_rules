# Organization

Manages AWS Organization and Control Tower account lifecycle — creation, enrollment, guardrails, and decommissioning.

Replaces [Accounts for Terraform (AfT)](https://github.com/aws-ia/terraform-aws-control_tower_account_factory) with a Bazel-integrated service that treats account provisioning as declared target dependencies.

Separated from GitOps to isolate cloud control plane operations from Kubernetes state reconciliation.

Part of **rules_sumicare** — a collection of reusable Bazel rules for platform engineering implementing Reference Cloud Native Architecture (RCNA) patterns and practices.

## Overview

This service (`@sumicare/organization`) manages AWS Organization units, Control Tower account factory operations, and landing zone guardrails. Account creation, OU placement, and SCP enrollment are expressed as Bazel targets with reviewable plans.

## License

Distributed under the terms of the [MIT License](../../../LICENSE).

For full trademark attribution and graphic material license details, see [ATTRIBUTION.md](../../../ATTRIBUTION.md).

## Disclaimer

All product names, marks, graphic material, and brands referenced in this documentation are the property of their respective owners. 
Their use here is for identification and reference only and does not imply endorsement or affiliation.
Sumicare is not affiliated with, endorsed by, or sponsored by any upstream project or its governing foundation unless explicitly stated.

## Attribution

> AWS, Amazon Web Services, and Control Tower are trademarks of Amazon.com, Inc. or its affiliates.
> Argo® is a registered trademark of The Linux Foundation. Use of this mark is subject to the [Linux Foundation Trademark Usage Guidelines](https://www.linuxfoundation.org/legal/trademark-usage).
