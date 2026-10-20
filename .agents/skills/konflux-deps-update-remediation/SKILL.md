---
name: konflux-deps-update-remediation
description: Reviews and remediates open Konflux/MintMaker dependency-update PRs on kubev2v/forklift-console-plugin. Closes PRs targeting unsupported release-2.8 and release-2.9. For release-2.10, release-2.11, release-2.12, and main, classifies each PR as approve or close with reasoning. Use when the user mentions Konflux PRs, MintMaker, renovate deps on release branches, konflux-deps-update-remediation, or asks to review/close Konflux dependency PRs.
disable-model-invocation: true
---

# Konflux deps-update remediation

Shared workflow; use explicit invocation as configured for this skill.

## Modes

Detect from the user request:

| Mode | Triggers | Actions |
|------|----------|---------|
| **Review** (default) | "review Konflux PRs", run this skill, "same review for Konflux" | Close 2.8/2.9 immediately. Classify 2.10+ / main. Present a table. **Do not** close or approve 2.10+ PRs unless asked. |
| **Close suggested** | "close with comments", "close the close set" | Close every PR previously marked **Close** in this conversation (or listed by the user), each with a short reason comment. Leave **Approve** PRs for the user. |

## Step 1 — List open Konflux PRs

From the plugin repo (`gh` uses the current remote; PRs are on `kubev2v/forklift-console-plugin`):

```bash
gh pr list --state open --limit 200 --json number,title,baseRefName,author,url,additions,deletions,files \\
  --jq '[.[] | select(.author.login | test("konflux";"i"))] | sort_by(.baseRefName, .number)'
```

Author logins look like `app/red-hat-konflux`. Include MintMaker branch names `konflux/mintmaker/...`.

## Step 2 — Unsupported branches (always close now)

If `baseRefName` is `release-2.8` or `release-2.9`:

```bash
gh pr close <N> --comment "Branch is not supported"
```

Use that comment **verbatim**. No extra sentences.

## Step 3 — Classify `release-2.10` / `release-2.11` / `release-2.12` / `main`

For each remaining PR:

1. `gh pr view <N> --json title,baseRefName,files,statusCheckRollup,additions,deletions`
2. `gh pr diff <N>` (at least `package.json` hunks)
3. If CI is red, read the **Test** workflow failed log (`gh run view <id> --log-failed`), not the validate-commits run.

### Console SDK stack (do not ignore)

Release branches are **not** the same as `main`.

| Branch | Typical SDK | Implication |
|--------|-------------|-------------|
| `release-2.11` | `@openshift-console/dynamic-plugin-sdk@1.8.0` (peers React 17, react-router 5) + `dynamic-plugin-sdk-webpack@1.3.0` (webpack `^5.75.0` only) | React 19 types, SDK 4.x, RTL 16, Testing Library majors → **Close** |
| `main` / newer | SDK 4.22 + webpack-sdk 4.22 (webpack `>=5.100`, React 18.3 peers) | Still reject incomplete lockfiles and ESLint 10-only plugins |

`dynamic-plugin-sdk-webpack` does **not** pin `webpack-dev-server` or `webpack-bundle-analyzer`. Those are still **webpack toolchain majors** — do not 100% approve them on a z-stream just because the SDK omits them.

### Verdict rules (strict)

**Approve** only if **all** are true:

- CI is fully green for the jobs that matter: lint, build, unit tests, e2e (if the workflow runs it), and Konflux plugin PR build when present (EC skip/neutral is OK).
- Lockfile is in sync (`npm ci` / `yarn` succeeds). The PR’s own CI is the proof.
- Change cannot affect the shipped plugin **or** the Console SDK runtime stack. Typical yes: GitHub Action pin, Konflux Tekton digest/task pin, same-stream builder image tag (`rhel9/nodejs-22:9.8-*`), lint-only package with lockfile + green CI (e.g. `globals`).
- Not a runtime, UI, i18n, webpack, or SDK major on a **release** branch.

**Close** if **any** are true:

- `npm ci` / yarn fails (EUSAGE lock desync, ERESOLVE, missing lockfile).
- Peer/engine mismatch with that branch’s CI Node (2.10 is Node **20**; packages needing Node ≥22 cannot land there).
- Console SDK / React / Testing Library major on 2.11 (or any branch still on SDK 1.8).
- ESLint 10+ plugin while the branch is ESLint 9.
- Runtime/UI major on a z-stream that already fails CI (PatternFly, webpack-cli that breaks `npm start`, sass-loader, etc.).
- Tooling major that fails the job it owns (knip v6 failing `yarn knip`, lint-staged engine fail).

**Worktree** when neither bar is met (green CI but runtime major, or e2e-only failure that might be flake):

- `git fetch upstream pull/<N>/head` then `git worktree add --detach /tmp/pr-wt-<N> upstream/pr-<N>` (origin may be a fork without `pull/` refs).
- `npm ci` or `yarn` as that branch uses.
- Exercise what CI did **not**: e.g. `npm start` / `webpack serve` for webpack-cli / webpack-dev-server; `ANALYZE_BUNDLE=true` webpack for analyzer.
- Do not treat “CI build passed” as proof of `npm start`.
- After the worktree: if still not 100% approve, **Close** (z-stream does not need the major). If product-safe and CI+worktree prove the touched path, **Approve**.

Green CI on a **runtime** major (`immer`, `i18next`, PatternFly) on a release branch is **not** 100% Approve. Prefer **Close** unless the user explicitly wants z-stream library upgrades.

### Known false friends

- Green GHA does **not** mean `packageManager` npm 12 actually ran (`setup-node` uses bundled npm 10 unless Corepack npm shims are on).
- `webpack-cli` v7 can break `webpack serve` while `npm run build` stays green.
- MintMaker “non-major” groups often include 0.x majors (`eslint-plugin-react-refresh` 0.4 → 0.5) and PatternFly minors that still change UI.

## Step 4 — Output

Present a markdown table (every Konflux PR from this run):

| PR | Branch | Verdict | Reasoning |
|----|--------|---------|-----------|

- **PR**: markdown link to the GitHub URL
- **Verdict**: `Closed` (2.8/2.9 already done), `Approve`, or `Close`
- **Reasoning**: one or two sentences (CI fact + SDK/lockfile/engine/runtime)

End with a one-line split: **Approve:** links. **Close (suggested):** numbers. Ask whether to close the Close set with comments (user usually approves the Approve set manually).

Do **not** `gh pr merge` or `gh pr review --approve`. Do **not** close 2.10+ until the user says to close them.

## Close-comment template (2.10+ only, when asked)

Short, specific, no policy quotes. Mention the failing mechanism (EUSAGE, ERESOLVE, Node engine, SDK 1.8 vs React 19, knip output, etc.).
