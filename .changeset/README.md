# Changesets

## How change management works

This repo uses [Changesets](https://github.com/changesets/changesets) to manage versioning, changelogs, and publishing.

The workflow has three stages:

1. **Describe** — When you make a change, write a changeset describing what changed and which packages are affected.
2. **Version** — Consume all pending changesets to bump package versions and update `CHANGELOG.md` files.
3. **Publish** — Publish updated packages to the registry and create git tags.

Dependency updates are automated by [taze](https://github.com/antfu-collective/taze), which bumps external dep versions.
Internal workspace dependencies use exact version pins (e.g. `"0.1.0"`) and are synced across packages by `scripts/sync-workspace-deps.mts`, which also generates changesets for any package whose deps were updated.

## Changesets CLI

The [Changesets CLI](https://github.com/changesets/changesets) is available via `pnpm exec changeset`. No npm scripts wrap it — call it directly.

### Create a changeset

```bash
pnpm exec changeset
```

Interactively select affected packages, choose a bump type (major/minor/patch), and write a summary. This creates a markdown file in `.changeset/` (e.g. `.changeset/dep-update-2026-07-25.md`). Commit it alongside your code.

Example output:

```markdown
---
"@sumicare/cdk8s-cdktn": minor
---

Add new cdk8s App chart resolver
```

### Check pending changesets

```bash
pnpm exec changeset status
```

### Version and update changelogs

```bash
pnpm exec changeset version
```

Consume all pending changesets, bump package versions, update `CHANGELOG.md` files, and update internal dependency specs. This also versions and tags the root `@sumicare/monorepo` package.

After this runs:
- Each affected package's `version` field in `package.json` is bumped
- `CHANGELOG.md` is generated/updated for each affected package
- Internal dep specs (e.g. `"@sumicare/cdk8s-cdktn": "0.1.0"`) are updated to the new version
- Pending changeset files in `.changeset/` are consumed (deleted)
- Git tags are created (e.g. `@sumicare/cdk8s-cdktn@0.2.0`, `@sumicare/monorepo@0.2.0`)

### Publish to npm

```bash
pnpm exec changeset publish
```

Publish all updated packages to the npm registry. Private packages are skipped (only versioned and tagged).

## Full workflow example

```bash
# 1. Make your changes
# ... edit code ...

# 2. Create a changeset
pnpm exec changeset
# Select @sumicare/cdk8s-cdktn, choose minor, write summary

# 3. Commit both the code and the changeset
git add -A
git commit -m "feat(chart): add new chart resolver"

# 4. Version packages (bumps versions, updates changelogs, creates tags)
pnpm exec changeset version

# 5. Publish to npm (if package is public)
pnpm exec changeset publish

# 6. Push tags and commits
git push --follow-tags
```

## Scripts

### `pnpm fix` — Fix everything

Runs all `fix:*` scripts in sequence:

```bash
pnpm fix
```

Individual fix scripts:

| Script | Description |
| --- | --- |
| `pnpm fix:node:biome` | Format and lint with Biome (`biome check --write`) |
| `pnpm fix:bazel` | Format Bazel files (`buildifier -r .`) |
| `pnpm fix:python` | Run all `fix:python:*` scripts in sequence |
| `pnpm fix:python:ruff` | Fix Python lint issues (`ruff check --fix`) |
| `pnpm fix:python:black` | Format Python files (`black`) |
| `pnpm fix:python:deps` | Update Python deps (`uv lock --upgrade`) |
| `pnpm fix:node` | Run all `fix:node:*` scripts in sequence |
| `pnpm fix:node:deps` | Update external Node deps (`taze -r --write`) |
| `pnpm fix:node:sync` | Sync internal deps + biome schema (`tsx scripts/sync-workspace-deps.mts`) |
| `pnpm fix:node:audit` | Fix audit overrides (`pnpm audit --fix=override`) |
| `pnpm fix:scan` | SBOM vulnerability scan (`tsx scripts/scan.mts`) |
| `pnpm fix:spellcheck` | Spell check (`tsx scripts/spellcheck.mts`) |

### `pnpm fix:spellcheck` — Spell check

Runs `cspell` using the shared dictionary from `sumicare_rules.code-workspace` (`cSpell.words`).

```bash
# Check all files (lists files with issues at the end)
pnpm fix:spellcheck

# Auto-populate unknown words into the workspace dictionary
pnpm fix:spellcheck --exclude
```

### Automated dependency updates

Node external deps are updated by [taze](https://github.com/antfu-collective/taze), which respects `minimumReleaseAge` from `pnpm-workspace.yaml`. Internal syncing and changeset generation are handled by `scripts/sync-workspace-deps.mts`. Python deps are updated by [uv](https://github.com/astral-sh/uv) via `uv lock --upgrade`.

```bash
# Full workflow: update all deps, sync internal deps + biome schema + changeset
pnpm fix

# Or step by step:
pnpm fix:node:deps    # update external Node deps (taze)
pnpm fix:node:sync    # sync internal deps + biome.json schema + generate changeset
pnpm fix:node:audit   # fix audit overrides
pnpm fix:scan         # SBOM vulnerability scan
pnpm fix:python:deps  # update Python deps (uv lock --upgrade)

# Preview internal sync without writing
pnpm fix:node:sync -- --dry-run
```

**taze** handles:
- External dep version updates (respecting `minimumReleaseAge` and `minimumReleaseAgeExclude`)
- Monorepo-aware recursive updates (`-r` flag)

**sync-workspace-deps.mts** handles:
- Syncing internal workspace dep specs to exact current versions
- Syncing `biome.json` `$schema` to match installed `@biomejs/biome` version
- Generating a `.changeset/dep-update-YYYY-MM-DD.md` file for all affected non-private packages

After running `pnpm fix`, commit the changes and run `pnpm exec changeset version` to consume the changeset.

## Conventional commits

This repo uses [conventional commits](https://www.conventionalcommits.org/) for commit messages (e.g. `feat(chart): add new chart resolver`).
Commit messages are enforced by `commitlint` (see `commitlint.config.ts`), which extends `@commitlint/config-conventional` with a 120-character header limit and a restricted set of allowed scopes: 
`chart`, `stack`, `bump`, `service`, `rule`, `lib`, `doc`.

## PR governance

PR governance is enforced by **git hooks** (via [Husky](https://github.com/typicode/husky)) and [commitlint](https://github.com/conventional-changelog/commitlint), without any external bot service.

### Git hooks

| Hook | Script | Description |
| --- | --- | --- |
| `pre-commit` | `pnpm fix:node:deps`, `pnpm fix:python:deps`, `pnpm fix:node:sync`, `pnpm fix:node:audit`, `pnpm fix:spellcheck`, `git add -u`, `lint-staged` | Update deps, sync workspace, audit, spellcheck, format and lint staged files |
| `pre-push` | `pnpm fix:scan` | SBOM vulnerability scan — blocks push if any vulnerabilities are found |
| `commit-msg` | `commitlint` | Enforce conventional commit rules on commit messages |

### Commitlint

Commit messages are validated by `commitlint` (see `commitlint.config.ts`). The config extends `@commitlint/config-conventional` with a 120-character header limit and a `scope-enum` rule that restricts scopes to: `chart`, `stack`, `bump`, `service`, `rule`, `lib`, `doc`.

```bash
# Validate a single commit message
echo "feat(chart): add new chart resolver" | pnpm exec commitlint

# Validate commits between two refs
pnpm exec commitlint --from HEAD~1 --to HEAD
```
