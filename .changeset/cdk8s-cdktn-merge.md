---
"@sumicare/cdk8s-cdktn": minor
"@sumicare/cdk8s-resolver-cdktn": major
---

Merge `@sumicare/cdk8s-resolver-cdktn` into `@sumicare/cdk8s-cdktn`.

- Add `./resolver` subpath export with `createCdkTnResolver`, `buildOutputIndex`, `lookupOutput`, and output fetch strategies
- Unify path alias to `CdkTnCdk8s/*`
- Remove `base/` reference projects (cdk8s, cdk-terrain, cdktf-cdk8s upstream clones, no longer needed)
- `@sumicare/cdk8s-resolver-cdktn` is deprecated; use `@sumicare/cdk8s-cdktn/resolver` instead
