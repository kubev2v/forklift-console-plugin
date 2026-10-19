<!-- FALLBACK REFERENCE: Use phases/quick-ref.md for normal flow.
     Read this file ONLY if a step fails or you need error recovery details. -->

# Phase 4: Reproduce (Human Checklist)



**Gate:** Auto-recap after user reports results
**For Bug tickets:** This phase is mandatory -- visual evidence is required.
**For non-bug tickets only:** Skip if there is no UI to reproduce.

**HARD CONSTRAINT:** For Bug tickets, this phase is NEVER skippable. If the
cluster is unavailable or reproduction fails, the agent MUST NOT skip this
phase. Instead:
1. Document that reproduction was attempted but could not be completed
2. Save a reproduction artifact noting the blocker reason
3. ASK the user: "Cluster is unavailable. Should I wait, or proceed without
   visual evidence?" Do NOT auto-advance.

**Default path (token-saving):** The **orchestrator** prints a numbered checklist.
The **human** navigates the UI, takes screenshots, and replies. No Playwright
MCP loop unless the user explicitly asks the agent to drive the browser.

See also: `phases/prompts/reproduce.md`.

---

## Prerequisites

- Console running and connected to a cluster (`npm run console` or real cluster URL)
- Dev server running (`npm start`) if testing against local code
- Investigation artifact available (`.agents/skills/dev-helper/state/${TICKET_KEY}/investigation.md`)

## Steps

### 0. Load project rules

**Before doing anything else in this phase**, check if the file
`.agents/skills/dev-helper/phases-rules/04-reproduce.md` exists. If it does,
read it now for screenshot paths and console URL conventions.

### 4.1 Build checklist from investigation

From `investigation.md`, produce:

1. Console URL (state `.reproduce.consoleUrl` or ask user; common: `http://localhost:9000`)
2. Numbered navigation / click steps
3. Expected vs actual
4. Screenshot destinations: `~/Downloads/${TICKET_KEY}/repro-*.png`

Print the checklist and **stop** until the user replies.

### 4.2 User reply

Accept: `reproduced` | `not reproduced` | `blocked`, plus optional console/
network notes and confirmation that screenshots were saved.

### 4.3 Save reproduction artifact

Write `.agents/skills/dev-helper/state/${TICKET_KEY}/reproduction.md` with steps, result, evidence paths,
and any errors. Optionally add `reproduction-script.ts` if the user or agent
provides reusable Playwright steps (optional, not required for advance).

### 4.4 Update state

```bash
.agents/skills/dev-helper/scripts/state-cli.sh set ${TICKET_KEY} \
  --arg url "${CONSOLE_URL}" \
  '.reproduce.consoleUrl = $url | .reproduce.reproducedAt = (now | todate)'
```

### 4.5 Advance

```bash
.agents/skills/dev-helper/scripts/state-cli.sh phase ${TICKET_KEY} jira-track
```

If not reproduced, user may retry, move to `ask-more-info`, or (non-bugs only)
proceed on code analysis alone.

### Override: agent-driven Playwright

Only if the user explicitly requests automation: use the workspace Playwright
MCP (`browser_navigate`, `browser_snapshot`, `browser_click`,
`browser_take_screenshot`, etc.). Prefer human checklist otherwise.

## Completion Checklist

Before advancing from this phase, `state-cli.sh phase` validates:

- [ ] For Bug tickets: `.agents/skills/dev-helper/state/${TICKET_KEY}/reproduction-script.ts` or `reproduction.md` exists
- [ ] Screenshots saved (recommended but not enforced by script)
