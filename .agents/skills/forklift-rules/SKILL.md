---
name: forklift-rules
description: >-
  Select and read the canonical Forklift repository rules for changed files and
  task context. Use before repository implementation, review, design, or
  Forklift-specific recommendations.
---

# Forklift rule selector

Use the canonical rule files under `.agents/rules/`; do not read the generated
Cursor wrappers unless verifying their metadata.

## Prerequisites

Run `npm run agent-setup:validate` after editing rules, skills, or `.codex/` config.

## Steps

1. Select rules for the paths you are about to change:

```bash
node scripts/agent-rules/select-rules.mjs --files src/plans/example.tsx
```

You may also pass positional paths after flags, or use `--json` for machine-readable output.

2. Always read `.agents/rules/project-context.md`.
3. Read every file-matched rule reported by the selector.
4. From the description-based candidates, read only those relevant to the task.
5. When adding or refreshing a canonical rule, edit `.agents/rules/**/*.md` and run `npm run agent-rules:generate` to refresh Cursor wrappers.

Cursor continues to use its native project-rule triggers.
