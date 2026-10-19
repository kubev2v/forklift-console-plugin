# Dev Helper

A Cursor AI skill that automates the full ticket lifecycle — from picking up a
Jira ticket to merged PR and post-merge cleanup. Includes a dashboard extension
for visual mission control.

## Quick Start

```bash
# Clone into your project
cd your-project
git clone https://github.com/avivtur/dev-helper .agents/skills/dev-helper

# Copy and fill in your config (start with minimal or full)
cp .agents/skills/dev-helper/examples/config.minimal.json \
   .agents/skills/dev-helper/dev-helper.config.json
# Edit dev-helper.config.json with your project's Jira + GitHub values

# Forklift: phase rules ship in phases-rules/ (no copy step)

# (Optional) Copy lesson templates
cp -r .agents/skills/dev-helper/examples/lessons.example/ \
      .agents/skills/dev-helper/lessons/

# (Optional) Install the dashboard extension
cd .agents/skills/dev-helper/dashboard && npm install && npm run build
ln -s "$(pwd)" ~/.cursor/extensions/dev-helper-dashboard
```

Then in Cursor, say: **"work on MTV-5300"**

**Docs:** [TOKEN-OPTIMIZATION.md](docs/TOKEN-OPTIMIZATION.md) · [CONTEXT-TIERS.md](docs/CONTEXT-TIERS.md) · [GOLD-EVAL.md](docs/GOLD-EVAL.md) · [LESSONS.md](docs/LESSONS.md) · [repo-pr-lessons](repo-pr-lessons/SKILL.md)

## Prerequisites

- `jq`, `gh` (GitHub CLI), `git`, `curl`
- `~/.jira-creds` with your Jira API token
- See [SETUP.md](SETUP.md) for the full guide

## How It Works

**Lightweight orchestrator** dispatches **phase subagents** (fresh context +
optional per-phase models). Human owns browser reproduce and running unit/E2E
tests after the AI writes them.

13-phase pipeline with configurable gates:

1. **Triage** — claim ticket, validate, classify complexity
2. **Investigate** — root cause, backend PRs, blast radius
3. **Ask More Info** — post Jira comment if blocked (optional)
4. **Reproduce** — human checklist + screenshots (mandatory for bugs)
5. **Jira Track** — sprint, story points, fix version
6. **Design** — multi-perspective plan (gated by default; personas by complexity)
7. **Implement** — code on branch, build/lint/i18n, **write** unit tests
8. **Verify** — human runs unit tests; AI fixes from pasted failures
9. **E2E Test** — AI writes Playwright; human runs (skip if no cluster)
10. **Send PR** — atomic 8-step PR creation
11. **Monitor PR** — CI, rebase, review replies, auto-merge (6 criteria)
11b. **Learn** — mandatory review; clear+no comments auto-skips subagent
12. **Post-Merge Jira** — transitions, QA, story points, epic closure

Prompt templates: [`phases/prompts/`](phases/prompts/).

## Project-Specific Rules

Forklift Console Plugin rules live in **`phases-rules/`** (committed in this
repo). Paths reference `.agents/rules/agents/*.md` in the console plugin.

For other projects, fork from `examples/phases-rules.example/`.

## Config

Two config examples:
- `examples/config.minimal.json` — 3 required fields
- `examples/config.full.json` — all fields with documentation (includes
  `phases.models` for subagent model routing)

See [SETUP.md](SETUP.md) for field-by-field documentation.

## License

Apache-2.0
