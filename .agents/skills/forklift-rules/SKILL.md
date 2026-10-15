---
name: forklift-rules
description: >-
  Select and read the canonical Forklift repository rules for changed files and
  task context. Use before repository implementation, review, design, or
  Forklift-specific recommendations.
---

# Forklift rule selector

Use the canonical rule files under .agents/rules/; do not read the generated
Cursor wrappers unless verifying their metadata.

1. Run the selector with the relevant repository paths:
   node .agents/skills/forklift-rules/scripts/select-rules.mjs --files <path...>.
2. Always read .agents/rules/project-context.md.
3. Read every file-matched rule reported by the selector.
4. From the description-based candidates, read only those relevant to the task.
   This mirrors Cursor's intelligent rule routing without loading every domain
   rule for every Codex task.
5. When adding or refreshing a canonical rule, edit its .agents/rules/**/*.md
   source and run npm run agent-rules:generate to refresh the Cursor wrapper.

Cursor continues to use its native project-rule triggers.
