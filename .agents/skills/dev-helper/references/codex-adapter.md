# Codex adapter for dev-helper

This adapter applies only when this skill is used in Codex. The existing phase
files, phase rules, configuration, scripts, lessons, and dashboard sources remain
the workflow source of truth.

## Client-specific operations

- Check whether `work-on-ticket` MCP is available in this Codex session. If it is,
  call it and follow its returned `orchestratorInstructions`. If it is not
  available, do not pretend it ran: read `phases/orchestrator-brief.md`, load or
  initialize ticket state with `scripts/state-cli.sh`, then follow
  `phases/quick-ref.md`, the phase prompt, and the phase rule when present.
  `.codex/config.toml` intentionally does not configure Jira or dev-helper MCP;
  Jira access must be separately available through user-local setup.
- Use the current Codex file, search, shell, and subagent tools. Replace Cursor-only
  semantic search calls with repository search/navigation, and use a Markdown
  design artifact plus an explicit approval checkpoint where a phase refers to
  Cursor plan/mode tools.
- Use the Codex custom agents in .codex/agents/ for the Developer, QE, UX,
  Architect, Security, and Forklift Expert perspectives. Each agent reads its
  matching canonical rule under .agents/rules/agents/; also read the phase rule
  under .agents/skills/dev-helper/phases-rules/ when one exists.
- If the client does not expose subagents, perform the same named perspectives
  sequentially and label their findings; do not silently omit a required review.
- The VS Code dashboard extension is a Cursor/VS Code surface. In Codex, report
  phase, blockers, and next action as a concise Markdown table instead of trying
  to install or launch the dashboard.
- Preserve the phase's user-approval gates. This adapter does not authorize Jira,
  GitHub, push, merge, or ticket-transition actions by itself.
