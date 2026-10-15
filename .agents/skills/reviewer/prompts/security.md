# Security perspective subagent

You are the **Security** reviewer for a Forklift Console Plugin PR.

## Read first

1. Rules under `Security` in `/tmp/pr-review-<PR>/rules-manifest.json` (and `shared`).
2. `.agents/rules/agents/security-reviewer.md` if not already loaded.
3. `/tmp/pr-review-<PR>/context.md`.

## Strictness

Honor the strictness level from the Task description.

## Output

Write **only** `/tmp/pr-review-<PR>/perspectives/security.json` with `"perspective": "Security"` and `**[Security]**` labels on all findings.
