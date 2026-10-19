---
name: reviewer
description: "Orchestrated multi-perspective PR review (Developer, QE, UX, Architect, Security, Forklift expert): lessons + rules manifest, six parallel Codex perspective subagents using the named custom agents below, full draft preview before GitHub post. Self-review fix mode runs pr-monitor. Use for review PR, self review, review #N, PR URL(s)."
disable-model-invocation: true
---

# PR Reviewer (orchestrator)

## Output you see vs what gets posted

| Shown to you only | Posted to GitHub |
|-------------------|------------------|
| **Context loaded** (rules-manifest.json) | — |
| **Lessons consulted** (lessons-context.md) | — |
| **preview.md** (event, full main body, inline table + links) | Same content as `review.json` after you confirm **Post?** |

Lessons and rule paths must **not** appear in `review.json` unless a finding stands on its own without citing the lesson.

## Modes

| Mode | Triggers | After review |
|------|----------|--------------|
| **Peer review** (default) | `review PR`, `review #N`, PR URL(s) | Full **preview** → your edits → **Post?** → `post-review.sh` |
| **Self review** | `self review`, `review my PRs` | Full preview → suggest fixing (no post). Fix phase → **pr-monitor** per PR |

## Strictness

1. **Ask** strictness before analysis unless the user stated it: `light` | `standard` | `strict` | `most strict`
2. **Self review** defaults to `most strict`
3. Peer default: `standard`

| Level | Expectation |
|-------|-------------|
| `light` | Blockers and clear bugs only |
| `standard` | Bugs, missing tests for new exports, a11y/i18n gaps, inconsistent patterns |
| `strict` | Edge cases, parallel flows, consumer blast radius, weak assertions |
| `most strict` | Above + consistency nits, docs, under-tested paths |

## Multiple PRs

1. Extract all PR numbers from input.
2. **One PR** → orchestrator workflow below.
3. **Multiple PRs** → one **child orchestrator** per PR in parallel (each runs steps 2–10); parent rolls up previews.
4. **Self-review fixes** → one PR at a time; then **pr-monitor** (unchanged).

## Orchestrator workflow (single PR)

You are the **orchestrator**. Do not substitute a single-agent review for the six perspective Tasks.

1. Confirm mode + strictness.
2. `.agents/skills/reviewer/scripts/gather-context.sh <PR>`
3. `.agents/skills/reviewer/scripts/select-lessons-for-pr.sh <PR>`
4. `.agents/skills/reviewer/scripts/select-rules-for-pr.sh <PR>`
5. Launch six perspective subagents in parallel, using the corresponding Codex custom agent. Each subagent must:
   - Follow the matching prompt in `.agents/skills/reviewer/prompts/` (`developer.md`, `qe.md`, `ux.md`, `architect.md`, `security.md`, `forklift-expert.md`).
   - Pass `<PR>`, strictness, and paths from `rules-manifest.json` for that perspective.
   - Write output to `/tmp/pr-review-<PR>/perspectives/<slug>.json` (`developer`, `qe`, `ux`, `architect`, `security`, `forklift-expert`).
6. After all Tasks complete, run `.agents/skills/reviewer/scripts/merge-perspective-reviews.sh <PR>`  
   Or merge manually into `review.json` if subagents need correction (same schema as below).
7. `.agents/skills/reviewer/scripts/validate-review.sh <PR>` — fix and re-validate until pass.
8. `.agents/skills/reviewer/scripts/build-review-preview.sh <PR>`
9. Present to the user **in order** (not a recap-only summary):
   - **Context loaded** — from `rules-manifest.json` (`shared` + each perspective).
   - **Lessons consulted** — contents of `lessons-context.md`.
   - **GitHub draft** — paste or summarize `preview.md`: **event**, full **main comment** text, **inline table** (path, line, GitHub link, comment, side).
10. **Peer:** If the user edits findings, update `review.json`, re-validate, rebuild preview. On confirm **Post?** → `post-review.sh <PR>`.  
    **Self review:** Do not ask to post; offer fix workflow.

### Perspective → prompts and rules

| Perspective | Codex agent | Prompt file | Agent rule (baseline) |
|-------------|-------------|------------------------|
| Developer | `developer` | `prompts/developer.md` | `agents/developer.md` + path-triggered typescript, react-components, selectors, new-component |
| QE | `qe-agent` | `prompts/qe.md` | `agents/qe-agent.md` + testing, playwright-testing |
| UX | `ux-reviewer` | `prompts/ux.md` | `agents/ux-reviewer.md` + i18n, styles, forklift-ux-patterns |
| Architect | `architect` | `prompts/architect.md` | `agents/architect.md` + `frontend/*.md` by feature |
| Security | `security-reviewer` | `prompts/security.md` | `agents/security-reviewer.md` |
| Forklift expert | `forklift-expert` | `prompts/forklift-expert.md` | `agents/forklift-expert.md`, `project-context.md` |

Path-triggered rules are computed by `select-rules-for-pr.sh` (deterministic).

### Perspective JSON schema

```json
{
  "perspective": "Developer",
  "rules_read": [".agents/rules/agents/developer.md"],
  "lessons_applied": ["implementation.md:14"],
  "findings": [
    { "kind": "inline", "path": "src/...", "line": 42, "body": "**[Developer]** ..." },
    { "kind": "body", "body": "**[Developer]** ..." }
  ]
}
```

**Dedup:** Skip findings already in **Existing Reviews** in `context.md`.

## Self-review fix phase (required)

For each PR in sequence:

1. Checkout PR branch (clean tree).
2. Apply findings from `/tmp/pr-review-<PR>/review.json`.
3. Commit (`-s`, `Resolves: <ticket>`) and push if needed.
4. Run **pr-monitor** (`.agents/skills/dev-helper/skills/pr-monitor/SKILL.md`, single-PR) — do not post self-review JSON.
5. Next PR.

If review was `APPROVE`, still run pr-monitor.

## Review checklist (subagents)

Apply at the chosen strictness. Detail lives in `.agents/rules/` (canonical `.md`); reminders:

### Developer
- `type` not `interface`; no `any`; explicit return types; `isEmpty()`; `??` not `||`; no barrel files; feature → shared → external
- Shared literals (`data-*` keys, field ids, fixed widths) in `constants.ts` / `*Constants.ts`, not in `*Utils.ts` (AGENTS.md **Constants vs utils**)
- Selectors for CRD property access ([selectors.md](.agents/rules/selectors.md))

### QE
- Tests for new exports; edge cases; async/races; form ↔ CR round-trip; API failure paths
- Playwright when E2E paths change ([playwright-testing.md](.agents/rules/workflows/playwright-testing.md))

### UX
- i18n utilities; loading/empty/error; PatternFly enums; custom `Select`; keyboard a11y

### Architect
- Consumer grep; parallel flows (wizard vs standalone); backwards-compatible types

### Security
- Input validation, RBAC, secrets exposure (see `.agents/rules/agents/security-reviewer.md`)

### Forklift expert
- GVK/selectors, provider phases, migration pipeline, inventory/API casing pitfalls

## review.json (GitHub)

```json
{
  "commit_id": "<from context.md Commit line>",
  "event": "COMMENT",
  "body": "<main review body>",
  "comments": [
    { "path": "src/...", "line": 42, "side": "RIGHT", "body": "**[Developer]** ..." }
  ]
}
```

### Main body (change requests)

```
Hi @<author>, thanks for this PR!

**<PR title>**

- **[Perspective]** Item not suitable for inline.

Please address the inline comments (and body items) before merge.
```

### Main body (APPROVE)

```
Hi @<author>, thanks for this PR!

**<PR title>**

LGTM — no change requests from this review.
```

## Event rules

- **`APPROVE`**: zero change suggestions; `comments: []`; body must not ask to address items.
- **`COMMENT`**: any inline or body change request.
- Never `REQUEST_CHANGES`.

## Rules

- Inline: **500 chars max**; no markdown headers in inline bodies.
- Comment lines must be in **Commentable Lines** ranges.
- Labels: `[Developer]`, `[QE]`, `[UX]`, `[Architect]`, `[Security]`, `[Forklift expert]`.
- Validator requires **≥3 perspectives** when there is any finding and `event=COMMENT`.
- Self review: post only if user explicitly asks after preview.

## Merge with your posted review

If you post (or already posted) your own GitHub review on the same PR:

1. `.agents/skills/reviewer/scripts/merge-posted-review.sh <PR> [github_username]`
2. Read `/tmp/pr-review-<PR>/merged-findings.md` — **Posted on GitHub** table plus **Orchestrator draft** (if `review.json` exists).
3. Do **not** re-post the orchestrator draft unless you still want those comments on GitHub; use the catalog to see overlap and gaps.

## Learn from review (coding standards)

After you post or correct a review, turn recurring **coding-standard** feedback into durable guidance:

1. From `posted-review.json` or your inline comments, extract themes (not one-off nits).
2. Search: `.agents/skills/dev-helper/scripts/lessons-grep.sh "<keywords>"` — skip duplicates.
3. Append new bullets under `## Lessons` in the matching theme file in `.agents/skills/dev-helper/lessons/` (see `docs/LESSONS.md` schema). Mirror important entries in `examples/lessons.example/` for teammates.
4. If the rule belongs in team docs (not grep lessons), update **AGENTS.md** or the relevant `.agents/rules/*.md` (e.g. `styles.md` for SCSS, `typescript.md` for TS patterns).
5. Optional: queue a batch in `lessons/pending/review-<PR>-<date>.md` for `approve lessons batch`.

Subagents and `select-lessons-for-pr.sh` will surface these on the next PR that touches similar paths (e.g. `TableView`, `data-*` attributes, SCSS).
